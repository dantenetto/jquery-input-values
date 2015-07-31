YUI.add('controls-wrapper', function (Y) {
    "use strict";

    var ControlsWrapper,
        L = Y.Lang;

    ControlsWrapper = {
        //can be replace for something such as data-bind or any other attr name
        attrName: 'name', 

        _getNodeValue: function (node) {
            switch (node.get('type')) {
                case 'radio':
                case 'checkbox':
                    return this.getCheckableValue(node);
                
                case 'select-one':                
                case 'select-multiple':
                    return this.getSelectValue(node);

                //types that should be ignored
                case 'file':
                case 'button':
                case 'reset':
                case 'image':
                case undefined:
                    return null;        
            }

            return node.get('value');
        },

        _getSelectOneValue: function (select) {
            return select.get('value');
        },

        _getSelectMultipleValue: function (select) {
            var values = [];

            select.get('options').each(function (option) {
                if (option.get('selected')) {
                    values.push(option.get('value'));
                }
            });

            return values;
        },

        getSelectValue: function (select) {
            var type = select.get('type'),
                value;

            if (type === 'select-one') {
                value = this._getSelectOneValue(select);
            } else {
                value = this._getSelectMultipleValue(select);
            }

            return value;
        },

        getCheckableValue: function (checkable) {
            if (!checkable.get('checked')) {
                return '';
            }

            return checkable.get('value');
        },

        getValues: function (container, includeDisabled) {
            var formObject, attr;
            
            attr = this.attrName;
            formObject = {};

            if (L.isString(container)) {
                container = Y.one(container);
            }
        
            container.all('input, select, textarea').each(function (node) {
                var name, disabled, type, value;
            
                name = node.getAttribute(attr);
                disabled = node.get('disabled');
            
                if (!name || (!includeDisabled && disabled)) {
                    return;
                }
            
                switch (node.get('type')) {
                    case 'radio':
                        if (!node.get('checked')) {
                            formObject[name] = formObject[name] || '';
                            break;
                        }
                    
                        formObject[name] = node.get('value');
                        break;

                    case 'checkbox':
                        if (!node.get('checked')) {
                            formObject[name] = formObject[name] || '';
                            break;
                        }

                        if (!formObject.hasOwnProperty(name) || !formObject[name]) {
                            formObject[name] = node.get('value');
                            break;
                        }
                    
                        if (!L.isArray(formObject[name])) {
                            value = [formObject[name]];
                            formObject[name] = value;
                        }
                    
                        formObject[name].push(node.get('value'));                    
                        break;
                
                    case 'select-one':
                        formObject[name] = node.get('value');
                        break;
                
                    case 'select-multiple':
                        formObject[name] = [];
                        node.get('options').each(function (option) {
                            if (option.get('selected')) {
                                formObject[name].push(option.get('value'));
                            }
                        });
                        break;

                    //ignored types
                    case 'file':
                    case 'button':
                    case 'reset':
                    case 'image':
                    case undefined:
                        break;

                    default:
                        formObject[name] = node.get('value');
                }
            });
        
            return formObject;
        },

        //container is optional
        getValue: function (target, container) {
            var querier;

            if (typeof target === 'string') {
                querier = container || Y;
                target = querier.one(target);
            }

            if (!target) return null;

            return this._getNodeValue(target);
        },

        setSelectValue: function (select, value) {
            var i, size, option;

            select.set('value', null);

            if (!L.isArray(value)) {
                select.set('value', value);
                return;
            }
            
            for (i = 0, size = value.length; i < size; i += 1) {
                option = select.all('option[value="' + value[i] + '"]');
                option.set('selected', true);
            }
        },

        //radio or checkbox
        _checkCheckableValue: function (checkable, value) {
            if (!L.isArray(value)) {
                value = [value];
            }

            if (value.indexOf(checkable.get('value')) > -1) {
                checkable.set('checked', true);
                return true;
            }

            return false;
        },

        checkCheckboxesValue: function (checkbox, value) {
            var i, size, anyWasChecked = false;

            checkbox.set('checked', false);

            for (i = 0, size = checkbox.size(); i < size; i += 1) {
                if (this._checkCheckableValue(checkbox.item(i), value)) {
                    anyWasChecked = true;
                }
            }

            return anyWasChecked;
        },

        checkRadiosValue: function (radios, value) {
            var i, size;

            radios.set('checked', false);

            for (i = 0, size = radios.size(); i < size; i += 1) {
                if (this._checkCheckableValue(radios.item(i), ('' + value))) {
                    return true;
                }
            }

            return false;
        },

        setValues: function (container, values) {
            var key, nodes, filter, type, attr;

            for (key in values) {
                if (!values.hasOwnProperty(key)) continue;

                filter = '[' + this.attrName + '="' + key + '"]';
                nodes = container.all(filter);

                if (nodes.size() === 0) { continue; }

                type = nodes.get('type')[0];

                switch (type) {
                    case 'select-one':
                    case 'select-multiple':
                        this.setSelectValue(nodes.item(0), values[key]);
                    break;

                    case 'radio':
                        this.checkRadiosValue(nodes, values[key]);
                    break;

                    case 'checkbox':
                        this.checkCheckboxesValue(nodes, values[key]);
                    break;
                    
                    //não existe controle de valores para esses tipos de input
                    case 'file':
                    case 'button':
                    case 'image':
                    case 'reset':
                    break;
                    
                    default:
                        nodes.item(0).set('value', values[key]);
                }
            }
        },

        //container is optional
        setValue: function (target, value, container) {

        }
    };

    Y.ControlsWrapper = ControlsWrapper;
}, '1.0', {
    requires: ['node']
});
