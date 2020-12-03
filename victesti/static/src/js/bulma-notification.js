import $ from "cash-dom";

const notificationTemplate = $('#notificationTemplate').contents();

export default class BulmaNotification {
    constructor(message, parentElementSelector, options={}) {
        this.element = notificationTemplate.clone()
        if(options.prepend == true){
            $(parentElementSelector).prepend(this.element);
        } else {
            $(parentElementSelector).append(this.element);
        }
        
        this.element.find('.notification-content').html(message);
        
        this.element.find('.delete').on('click', () => {
            this.element.detach();
        });
        
        if(options.hasOwnProperty('type')) {
            this.element.addClass(`is-${options.type}`);
        }

        if(options.hasOwnProperty('isLight')) {
            if(options.isLight == true)
                this.element.addClass(`is-light`);
        }

        if(options.hasOwnProperty('classes')) {
            options.classes.forEach(cssClass => {
                this.element.addClass(cssClass);
            })
        }
    }
}