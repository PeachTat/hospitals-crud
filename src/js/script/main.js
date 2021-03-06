if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}

(function (ELEMENT) {
    ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
    ELEMENT.closest = ELEMENT.closest || function closest(selector) {
        if (!this) return null;
        if (this.matches(selector)) return this;
        if (!this.parentElement) { return null }
        else return this.parentElement.closest(selector)
    };
}(Element.prototype));

(function () {
    var arr = [window.Element, window.CharacterData, window.DocumentType];
    var args = [];

    arr.forEach(function (item) {
        if (item) {
            args.push(item.prototype);
        }
    });

    // from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
    (function (arr) {
        arr.forEach(function (item) {
            if (item.hasOwnProperty('remove')) {
                return;
            }
            Object.defineProperty(item, 'remove', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function remove() {
                    this.parentNode.removeChild(this);
                }
            });
        });
    })(args);
})();

let hospitals = [];
const persisted = localStorage.getItem('hospitals');

if (persisted) {
    hospitals = JSON.parse(persisted);
}

window.onload = () => {
    if (persisted && hospitals.length > 0) {
        createPersistedTable();
    }
    addButtonClickHandler();
    deleteHospital();
    editHospital();
}

const createId = () => {
    return `f${(~~(Math.random() * 1e8)).toString(16)}`;
}

const createItemControls = () => {
    const buttons = [
        {
            title: 'Удалить',
            class: 'delete',
        },
        {
            title: 'Редактировать',
            class: 'edit',
        }
    ];
    const div = document.createElement('div');
    div.className = 'table-item__controls';

    buttons.forEach((button) => {
        const btn = document.createElement('button');

        btn.className = button.class;
        btn.innerHTML = button.title;
        btn.type = 'button';

        div.appendChild(btn);
    })

    return div;
}

const createPersistedTable = () => {
    const nodata = document.querySelector('.no-data');
    const table = document.querySelector('.table');

    nodata.remove();

    hospitals.forEach((hospital) =>  {
        const hospitalNode = document.createElement('div');
        const controls = createItemControls();
        hospitalNode.className = 'table-item';
        hospitalNode.appendChild(controls);
        hospitalNode.setAttribute('data-id', hospital.id);

        Object.keys(hospital).forEach((key) => {
            if (key !== 'id') {
                const div = document.createElement('div');
    
                div.innerHTML = hospital[key];
                hospitalNode.appendChild(div);
            }
        })

        table.appendChild(hospitalNode);
    })

}

const modalCloseHandler = () => {
    const modal = document.querySelector('.modal');

    modal.classList.remove('modal_active');
}

const modalOpenHandler = (type) => {
    const modal = document.querySelector('.modal');
    const buttonClose = document.querySelector('.modal-close');
    const form = document.querySelector('form');
    const button = document.querySelector('.modal-submit')

    if (!type && button.innerHTML !== 'Добавить') {
        button.innerHTML = 'Добавить';
    }

    if (type && type === 'edit' && button.innerHTML !== 'Изменить' ) {
        button.innerHTML = 'Изменить';
    }

    buttonClose.onclick = function (event) {
        event.preventDefault();
        modalCloseHandler(); 
        form.reset();
    }

    modal.classList.add('modal_active');
}

const addButtonClickHandler = () => {
    const button = document.querySelector('.button-add');

    button.onclick = () => {
        modalOpenHandler();
        addHospital();
    }
}

const addHospital = () => {
    let button = document.querySelector('.modal-submit');
    
    button.onclick = function (e) {
        let newHospital = {};
        let form = document.querySelector('form');
        let inputs = document.querySelectorAll('input');
        inputs = Array.prototype.slice.call(inputs);
        let table = document.querySelector('.table');
        let nodata = document.querySelector('.no-data');
        let empty = false;
        const id = createId();
        e.preventDefault();
        

        inputs.forEach((input) => {
            if (input.value.length < 1) {
                empty = true;
                return;
            }
            newHospital[input.name] = input.value;

        })
        newHospital.id = id;

        if (empty) {
            empty = false;
            return;
        }

        hospitals.push(newHospital);
        const json = JSON.stringify(hospitals);

        localStorage.setItem('hospitals', json);

        let hospitalNode = document.createElement('div');
        const controls = createItemControls();
        hospitalNode.className = 'table-item';
        hospitalNode.setAttribute('data-id', id)
        inputs.forEach((input) => {
            const div = document.createElement('div');

            div.innerHTML = input.value;
            hospitalNode.appendChild(div);
        })

        if (nodata) {
            nodata.remove();
        }
        hospitalNode.appendChild(controls);

        table.appendChild(hospitalNode);

        form.reset();
        modalCloseHandler();
        deleteHospital();
        editHospital();
    }


}

const deleteHospital = () => {
    const buttons = Array.prototype.slice.call(document.querySelectorAll('.delete'));

    buttons.forEach((button) => {
        button.onclick = function () {
            const parent = this.closest('.table-item')
            const id = parent.getAttribute('data-id')

            hospitals = hospitals.filter((el)=> {
                return el.id !== id
            })

            const json = JSON.stringify(hospitals)
            localStorage.setItem('hospitals', json)
            parent.remove();
            if (hospitals.length < 1) {
                renderNoData();
            }
        }
    })
}

const renderNoData = () => {
    const table = document.querySelector('.table');
    const nodata = document.createElement('div');
    nodata.className = 'no-data';
    nodata.innerHTML = 'Нет данных';
    table.appendChild(nodata)

}

const editHospital = () => {
    const buttons = Array.prototype.slice.call(document.querySelectorAll('.edit'));

    buttons.forEach((button) => {
        button.onclick = function () {
            const buttonSub = document.querySelector('.modal-submit');
            const inputs = Array.prototype.slice.call(document.querySelectorAll('input'))
            const parent = this.closest('.table-item');
            const form = document.querySelector('form');
            let empty = false;
            const id = parent.getAttribute('data-id');
            const selectedHospital = hospitals.find((el)=> {
                return el.id === id;
            })


            inputs[0].value = selectedHospital.full_name;
            inputs[1].value = selectedHospital.address;
            inputs[2].value = selectedHospital.phone;

            modalOpenHandler('edit');

            buttonSub.onclick = function (event) {
                event.preventDefault();

                inputs.forEach((input) => {
                    if (input.value.length < 1) {
                        empty = true;
                        return;
                    }
                })

                if (empty) {
                    empty = false;
                    return;
                }

                hospitals = hospitals.map((el)=> {
                    if (el.id === id) {
                        return {
                            ...el, 
                            full_name: inputs[0].value,
                            address: inputs[1].value,
                            phone: inputs[2].value
                        }
                    }
                    return {...el}
                })

                const json = JSON.stringify(hospitals)
                localStorage.setItem('hospitals', json)

                let children = parent.querySelectorAll('div')
                children = Array.prototype.slice.call(children)
                children = children.filter((el) => {
                    return !el.classList.contains('table-item__controls')
                })

                children.forEach((child, index) => {
                    child.innerHTML = inputs[index].value;
                });

                modalCloseHandler();
                form.reset();
            }
        }
    })
    
}
