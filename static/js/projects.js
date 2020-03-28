// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/projects',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        create: function(name, description) {
            let ajax_options = {
                type: 'POST',
                url: 'api/projects',
                accepts: 'application/json',
                contentType: 'application/json',
                //dataType: 'json',
                data: JSON.stringify({
                    'name': name,
                    'description': description
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_create_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        update: function(name, description) {
            let ajax_options = {
                type: 'PUT',
                url: 'api/projects/' + name,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'description': description
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_update_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'delete': function(name) {
            let ajax_options = {
                type: 'DELETE',
                url: 'api/projects/' + name,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_delete_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    let $name = $('#name'),
        $description = $('#description');

    // return the API
    return {
        reset: function() {
            $name.val('');
            $description.val('').focus();
        },
        update_editor: function(name, description) {
            $name.val(name);
            $description.val(description).focus();
        },
        build_table: function(project) {
            let rows = ''

            // clear the table
            $('.conteudo table > tbody').empty();

            // did we get a people array?
            if (project) {
                for (let i=0, l=project.length; i < l; i++) {
                    rows += `<tr><td class="name">${project[i].name}</td><td class="description">${project[i].description}</td><td>${project[i].timestamp}</td></tr>`;
                }
                $('table > tbody').append(rows);
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $name = $('#name'),
        $description = $('#description');

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)

    // Validate input
    function validate(name, description) {
        return name !== "" && description !== "";
    }

    // Create our event handlers
    $('#create').click(function(e) {
        let name = $name.val(),
            description = $description.val();

        e.preventDefault();

        if (validate(name, description)) {
            model.create(name, description)
        } else {
            alert('Problema com os parâmetros: nome ou descrição');
        }
    });

    $('#update').click(function(e) {
        let name = $name.val(),
            description = $description.val();

        e.preventDefault();

        if (validate(name, description)) {
            model.update(name, description)
        } else {
            alert('Problema com os parâmetros: nome ou descrição');
        }
        e.preventDefault();
    });

    $('#delete').click(function(e) {
        let name = $name.val();

        e.preventDefault();

        if (validate('placeholder', name)) {
            model.delete(name)
        } else {
            alert('Problema com os parâmetros: nome');
        }
        e.preventDefault();
    });

    $('#reset').click(function() {
        //location.reload();
        //model.read();
        window.location.reload();
        view.reset();
    })

    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target),
            name,
            description;

        name = $target
            .parent()
            .find('td.name')
            .text();

        description = $target
            .parent()
            .find('td.description')
            .text();

        view.update_editor(name, description);
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        view.build_table(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_update_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = "Msg de Erro:" + textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));
