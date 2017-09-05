String.prototype.replaceAll = function(de, para) {
    var str = this;
    var pos = str.indexOf(de);
    while (pos > -1) {
        str = str.replace(de, para);
        pos = str.indexOf(de);
    }
    return (str);
}

var routines;
var currentRoutine;
var currentItem;
var currentPage = 'mainPage';

function initApp() {
    document.addEventListener("backbutton", onBackKeyDown, false);

    $("#listViewExercise").on("filterablebeforefilter", fillAutocompleteExercise);

    routines = JSON.parse(window.localStorage.getItem('routines'));
    if (routines == null) {
        routines = [];
    }

    fillRoutinesList();
}

/***********************************************************************************************************************
 * Default exit, pede confirmação
 */

function onConfirmExit(button) {
    if (button == 2) {// If User selected No, then we just do nothing
        return;
    } else {
        navigator.app.exitApp();// Otherwise we quit the app.
    }
}

/** **************** */

var backFunction = null;

function onBackKeyDown() {
    if (backFunction == null) {
        navigator.notification.confirm("Deseja encerrar o SimpliFit?", onConfirmExit, "Confirmação", "Sim,Não");
    } else {
        backFunction();
    }
}

function doSaveRoutines() {
    window.localStorage.setItem('routines', JSON.stringify(routines));
}

function indexOfId(arr, id) {
    for (index in arr) {
        if (arr[index].id == id) {
            return index;
        }
    }
    return null;
}

function findId(arr, id) {
    return arr[indexOfId(arr, id)];
}

function gotoMainPage() {
    backFunction = null;
    $.mobile.changePage('#mainPage');
    fillRoutinesList();
}

function fillRoutinesList() {
    var listRoutines = $('#listRoutines');

    listRoutines.children().remove();

    if (routines.length == 0) {
        listRoutines.append($('<p>Nenhum treino foi criado.</p>'));
    } else {
        routines.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        var html = '';
        routines.forEach(function(routine) {
            var text = '<div class="nd2-card" onclick="showRoutine(' + routine.id + ')">';
            text += '<div class="card-title"><h3 class="card-primary-title">' + routine.name + '</h3></div>';
            if(routine.obs){
                text += '<div class="card-supporting-text">'+routine.obs+'</div>';
            }
            text += '</div>';
            
            html += text;
        });
        listRoutines.html(html);
    }
}

function _itemToTextMenu(itemId) {
    var result = ''
            + '<div data-role="popup" id="itemMenu${itemId}">'
            + '<ul data-role="listview" data-icon="false">'
            + '<li><a class="ui-btn" onclick="editItem(${itemId});">Editar Exercício</a>'
            + '<li><a class="ui-btn" onclick="if(confirm(\'Apagar o exercício?\')) deleteItem(${itemId});">Remover Exercício</a>'
            + '</ul>' + '</div>';
    return result.replaceAll('${itemId}', itemId);
}

function itemToText(item) {

    var colors = [ 'Purple', 'SteelBlue' ];

    // montando o card
    var text = '<div class="nd2-card"><div data-role="header" role="banner" class="ui-header ui-bar-inherit" style="background-color: '
            + colors[item.sequence % 2]
            + '"><div class="card-title has-supporting-text" style="width: 85%; padding-top: 1px; padding-bottom: 1px;"><h4>';
    text += item.exercise;
    text += '</h4></div><a href="#itemMenu'
            + item.id
            + '" data-rel="popup" class="ui-btn-right ui-btn" data-wow-delay="1.2s" aria-haspopup="true" aria-owns="itemMenu'
            + item.id
            + '" aria-expanded="false" data-role="button" role="button"><i class="zmdi zmdi-more-vert"></i></a></div>';
    text += '<div class="card-supporting-text has-action has-title">';
    if (item.equipment) {
        text += '<label>Equipamento:</label>' + item.equipment;
    }
    if (item.series) {
        text += '<label>Séries:</label>' + item.series;
    }
    if (item.reps) {
        text += '<label>Repetições:</label>' + item.reps;
    }
    if (item.weight) {
        text += '<label>Carga:</label>' + item.weight;
    }
    text += '</div></div>';
    // montando o menu do card
    text += _itemToTextMenu(item.id);

    return text;
}

function fillItemsList() {
    var listItems = $('#showRoutineContent');

    listItems.children().remove();

    var items = currentRoutine.items;

    if (items.length == 0) {
        listItems.html('');
    } else {
        var html = '';

        items.forEach(function(item) {
            html += itemToText(item);
        });

        listItems.html(html).enhanceWithin();
        ;
    }
    // listItems.listview('refresh'); // isso supre um bug do jqm
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function gotoShowRoutinePage() {
    backFunction = gotoMainPage;
    $.mobile.changePage('#showRoutinePage');
}

function showRoutine(id) {
    currentRoutine = findRoutine(id);

    $('#viewRoutineName').html(currentRoutine.name);
    if (currentRoutine.obs == '') {
        $('#viewRoutineObs').hide();
    } else {
        $('#viewRoutineObs').show();
    }
    gotoShowRoutinePage();
    fillItemsList();
}

function newRoutine() {
    currentRoutine = {
        id : 0,
        name : '',
        obs : '',
        items : []
    };
    editRoutine(gotoMainPage);
}

function editRoutine(_backFunction) {
    if (_backFunction) {
        backFunction = _backFunction;
    } else {
        backFunction = gotoShowRoutinePage;
    }

    $('#routineId').val(currentRoutine.id);
    $('#inputName').val(currentRoutine.name);
    $('#inputObs').val(currentRoutine.obs);

    $.mobile.changePage('#editRoutinePage');
}

function findRoutine(routineId) {
    return findId(routines, routineId);
}

function saveRoutine() {
    currentRoutine.id = $('#routineId').val();
    currentRoutine.name = toTitleCase($('#inputName').val().trim());
    currentRoutine.obs = $('#inputObs').val().trim();

    if (currentRoutine.id == 0) {// novo treino
        currentRoutine.id = (0 - routines.length) - 1;
        routines[routines.length] = currentRoutine;
    }

    doSaveRoutines();

    gotoMainPage();
}

function nextSequence() {
    var items = currentRoutine.items;
    return (items.length == 0) ? 1 : parseInt(items[items.length - 1].sequence) + 1;
}

function fillIntercalate(currentItem) {
    var slctIntercalate = $('#slctIntercalate');
    var currentValue = 0;

    slctIntercalate.empty();
    slctIntercalate.append($('<option />').val(0).text('Não intercalado'));
    currentRoutine.items.forEach(function(element) {
        if (element.id != currentItem.id) {
            if (element.sequence == currentItem.sequence) {
                currentValue = element.id;
            }

            slctIntercalate.append($('<option />').val(element.id).text(element.exercise));
        }
    });
    slctIntercalate.val(currentValue);
    slctIntercalate.selectmenu().selectmenu('refresh');
}

function gotoEditItemPage() {
    backFunction = gotoShowRoutinePage;
    $.mobile.changePage('#editItemPage');
}

function doEditItem(item) {
    currentItem = item;

    $('#itemId').val(item.id);
    $('#inputExercise').val(item.exercise);
    $('#inputEquipment').val(item.equipment);
    $('#inputSeries').val(item.series);
    $('#inputReps').val(item.reps);
    $('#inputWeight').val(item.weight);
    $('#inputSequence').val(item.sequence);
    gotoEditItemPage();
    fillIntercalate(item);
}

function newItem() {
    doEditItem({
        id : 0,
        exercise : '',
        equipment : '',
        series : '',
        reps : '',
        weight : '',
        sequence : nextSequence()
    })
}

function findItem(itemId) {
    var items = currentRoutine.items;
    return findId(items, itemId);
}

function editItem(itemId) {
    doEditItem(findItem(itemId));
}

function saveItem() {
    var sequence;
    var valIntercalate = $('#slctIntercalate').val();
    if (valIntercalate == 0) {
        // não intercalado
        sequence = $('#inputSequence').val();
    } else {
        // é intercalado
        var intercalatedItem = findItem(valIntercalate);
        sequence = intercalatedItem.sequence;
    }

    if (currentItem.id == 0) { // novo exercício
        var items = currentRoutine.items;
        currentItem.id = (0 - items.length) - 1;
        items[items.length] = currentItem;
    }

    currentItem.exercise = toTitleCase($('#inputExercise').val());
    currentItem.equipment = $('#inputEquipment').val();
    currentItem.series = $('#inputSeries').val();
    currentItem.reps = $('#inputReps').val();
    currentItem.weight = $('#inputWeight').val();
    currentItem.sequence = sequence;

    // (re)ordenando conforme a sequencia
    currentRoutine.items.sort(function(a, b) {
        return a.sequence - b.sequence
    });
    
    doSaveRoutines();

    showRoutine(currentRoutine.id);
}

function deleteRoutine() {
    routines.splice(indexOfId(routines, currentRoutine.id), 1);
    gotoMainPage();
}

function deleteItem(itemId) {
    currentRoutine.items.splice(indexOfId(currentRoutine.items, itemId), 1);
    showRoutine(currentRoutine.id);
}

// **********************

function setValueAutocompleteExercise(value) {
    $('#inputExercise').val(value);
    var listView = $('#listViewExercise');
    listView.html('');
    listView.listview('refresh');
}

var QUERY_PREFIX = 'exercício ';

function fillAutocompleteExercise(event, data) {
    var listView = $(this);
    var searchText = $(data.input).val();

    listView.html('');

    if (searchText && searchText.length > 4) {// mais de 5 chars digitados
        $.ajax({
            url : "http://suggestqueries.google.com/complete/search?client=firefox&hl=pt",
            crossDomain : true,
            dataType : 'jsonp',
            headers : {
                'Access-Control-Allow-Origin' : '*',
                'Access-Control-Allow-Methods' : 'POST, GET, OPTIONS, PUT',
                'Content-Type' : 'application/json',
                'Accept' : 'application/json'
            },
            data : {
                q : QUERY_PREFIX + searchText
            },
            success : function(data) {
                // Api returns [ Original Keyword, Searches[] ]
                var results = data[1];
                var html = '';
                results.forEach(function(result) {
                    if (result.indexOf(QUERY_PREFIX) == 0) {
                        var resultValue = toTitleCase(result.substring(QUERY_PREFIX.length));
                        html += '<li><a onclick="setValueAutocompleteExercise(`' + resultValue + '`)">' + resultValue
                                + '</a></li>';
                    }
                });

                listView.html(html);
                listView.listview('refresh');
                listView.trigger('updatelayout');
            },
            error : function(jqXHR, textStatus, errorThrown) {
                // Não conectado?
            }
        });
    }
}
/***********************************************************************************************************************
 * scope.search = function() { // If searchText empty, don't search if (scope.searchText == null ||
 * scope.searchText.length < 1) return;
 * 
 * var url = 'http://suggestqueries.google.com/complete/search?'; url +=
 * 'callback=JSON_CALLBACK&client=firefox&hl=en&q=' url += encodeURIComponent(scope.searchText);
 * $http.defaults.useXDomain = true;
 * 
 * $http({ url: url, method: 'JSONP', headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods':
 * 'POST, GET, OPTIONS, PUT', 'Content-Type': 'application/json', 'Accept': 'application/json'
 *  } }). success(function(data, status, headers, config) {
 *  // Api returns [ Original Keyword, Searches[] ] var results = data[1]; if (results.indexOf(scope.searchText) === -1) {
 * data.unshift(scope.searchText); } scope.suggestions = results; scope.selectedIndex = -1; }). error(function(data,
 * status, headers, config) { console.log('fail'); // called asynchronously if an error occurs // or server returns
 * response with an error status. });
 **********************************************************************************************************************/
