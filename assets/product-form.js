if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();
        this.form = this.querySelector('.form');
        console.log(this.form)
        this.form.querySelector('[name=id]').disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      bundleAddtocart() {
        this.products = []
        document.querySelectorAll('.bundle-checkbox').forEach((element) => {
          console.log(element.checked )
            if (element.checked == true) {
                console.log(element);
                this.products.push(element.value)
                console.log(this.products);
            }
        })
        return this.products
    }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        
        console.log(this.form.querySelector("input[name='id']").value)
        console.log(document.querySelector(`#Quantity-${this.dataset.sectionId}`).value)


        const selected = this.bundleAddtocart()


        const seletedItems = selected.map((variantId) =>
          (
              {
                  "id": variantId,
                  "quantity": 1,
                  'properties': {
                    'bundel': true
                  }
              }
          ))
        
        const formData = {
          "items" : [
            {
              id:this.form.querySelector("input[name='id']").value,
              quantity:document.querySelector(`#Quantity-${this.dataset.sectionId}`).value
            }, ...seletedItems
          ],
          "sections": this.cart.getSectionsToRender().map((section) => section.id)
        };

        console.log(seletedItems)
        
        
        fetch(window.Shopify.routes.root + 'cart/add.js', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData),
          })
          .then((response) => response.json())
          .then((response) => {
            this.cart.renderContents(response);
          }
        )
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }
    }
  );
}
