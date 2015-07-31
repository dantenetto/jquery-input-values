/*!
 * jQuery form/json converter plugin
 * Original author: @dantenetto 
 * Licensed under the MIT license
 */
(function ($) {
    "use strict";
    var ControlsWrapper;
    
    ControlsWrapper = {
        _getSelectOneValue: function (select) {
            return select.val();
        },

        _getSelectMultipleValue: function (select) {
            var values = [];
            
            $.each(select[0].options, function (i, option) {
                var $option = $(option);
                
                if ($option.is(':selected')) {
                    values.push($option.val());
                }
            });

            return values;
        },

        getSelectValue: function (select) {
            var type,
                value;

            type = select[0].type;
                
            if (type === 'select-one') {
                value = this._getSelectOneValue(select);
            } else {
                value = this._getSelectMultipleValue(select);
            }

            return value;
        },

        getCheckboxValue: function (checkbox) {
            if (!checkbox.is(':checked')) {
                return '';
            }

            return checkbox.val();
        },

        getValues: function (container, includeDisabled) {
            var formObject = {};
        
            container.find('input, select, textarea').each(function (i, node) {
                var name, disabled, type, value, $node;
            
                $node = $(node);
            
                name = $node.attr('name');
                disabled = $node.is(':disabled');
            
                if (!name || (!includeDisabled && disabled)) {
                    return;
                }
            
                switch (node.type) {
                    case 'radio':
                        if (!$node.is(':checked')) {
                            formObject[name] = formObject[name] || '';
                            break;
                        }
                    
                        formObject[name] = $node.val();
                        break;

                    case 'checkbox':
                        if (!$node.is(':checked')) {
                            formObject[name] = formObject[name] || '';
                            break;
                        }

                        if (!formObject.hasOwnProperty(name) || !formObject[name]) {
                            formObject[name] = $node.val();
                            break;
                        }
                    
                        if (!$.isArray(formObject[name])) {
                            value = [formObject[name]];
                            formObject[name] = value;
                        }
                    
                        formObject[name].push($node.val());                    
                        break;
                
                    case 'select-one':
                        formObject[name] = $node.val();
                        break;
                
                    case 'select-multiple':
                        formObject[name] = [];
                        $.each(node.options, function (i, option) {
                            var $option = $(option);
                            if ($option.is(':selected')) {
                                formObject[name].push($option.val());
                            }
                        });
                        break;
                    
                    //atributos que devem ser ignorados
                    case 'button':
                    case 'reset':
                    case 'image':
                    case undefined:
                        break;

                    default:
                        formObject[name] = $node.val();
                }
            });
        
            return formObject;
        },

        setSelectValue: function (select, value) {
            var i, size, option;

            select.val(null);

            if (!$.isArray(value)) {
                select.val(value);
                return;
            }
            
            for (i = 0, size = value.length; i < size; i += 1) {
                option = select.find('option[value="' + value[i] + '"]');
                option.prop('selected', true);
            }
        },

        //radio or checkbox
        _checkCheckableValue: function (checkable, value) {
            if (!$.isArray(value)) {
                value = [value];
            }
            
            $.each(value, function (i) {
                value[i] = '' + value[i];
            });

            if (value.indexOf(checkable.val()) > -1) {
                checkable.prop('checked', true);
                return true;
            }

            return false;
        },

        checkCheckboxesValue: function (checkbox, value) {
            var i, size, anyWasChecked = false;

            checkbox.prop('checked', false);

            for (i = 0, size = checkbox.length; i < size; i += 1) {
                if (this._checkCheckableValue(checkbox.eq(i), value)) {
                    anyWasChecked = true;
                }
            }

            return anyWasChecked;
        },

        checkRadiosValue: function (radios, value) {
            var i, size;

            radios.prop('checked', false);

            for (i = 0, size = radios.length; i < size; i += 1) {
                if (this._checkCheckableValue(radios.eq(i), ('' + value))) {
                    return true;
                }
            }

            return false;
        },

        setValues: function (container, values) {
            var key, nodes, filter, type;

            for (key in values) { if (values.hasOwnProperty(key)) {
                filter = '[name="' + key + '"]';
                nodes = container.find(filter);

                if (nodes.length === 0) { continue; }

                type = nodes[0].type;

                switch (type) {
                    case 'select-one':
                    case 'select-multiple':
                        this.setSelectValue(nodes.eq(0), values[key]);
                    break;

                    case 'radio':
                        this.checkRadiosValue(nodes, values[key]);
                    break;

                    case 'checkbox':
                        this.checkCheckboxesValue(nodes, values[key]);
                    break;
                    
                    case 'file':
                        //fileinput can only be setted to empty string
                        if (values[key] !== '') continue;

                        nodes.eq(0).val('');
                    break;
                    
                    //não existe controle de valores para esses tipos de input                    
                    case 'button':
                    case 'image':
                    case 'reset':
                    case undefined:
                    break;
                    
                    default:
                        nodes.eq(0).val(values[key]);
                }
            }}
        }
    };

    //window.ControlsWrapper = ControlsWrapper;
    
    $.fn.inputValues = function (values) {
        if (!values) {
            return ControlsWrapper.getValues(this);
        }
        
        ControlsWrapper.setValues(this, values);
        
        return this;
    }
}(jQuery));
