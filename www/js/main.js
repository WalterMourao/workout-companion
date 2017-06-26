var routines;
var currentRoutine;
var currentItem;

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
        listRoutines.append($('<li>Não há treinos</li>'));
    } else {
        routines.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
        
        var html = '';
        routines.forEach(function(routine) {
            var text = '<h2>' + routine.name + '</h2>';
            text = '<li><a onclick="showRoutine(' + routine.id + ')">' + text + '</a>';
            text += '<a onclick="editRoutine(' + routine.id + ')" data-icon="gear">Editar</a></li>'
            html += text;
        });
        listRoutines.html(html);
    }
    listRoutines.listview('refresh'); // isso supre um bug do jqm
}

function itemToText(item) {
    var text = '<h3>' + item.exercise + '</h3><p>' + item.series + 'x' + item.reps;
    if (item.equipment != '') {
        text += ' [Eqpto: ' + item.equipment + ']';
    }
    if (item.weight != '') {
        text += ' [Carga: ' + item.weight + ']';
    }
    text += '</p>';
    return text;
}

function itemToTextEdit(item) {
    var text = '<a onclick="editItem(' + item.id + ')">' + itemToText(item) + '</a>';
    return text;
}

function doFillItemsList(listId, itemToTextFunction) {
    var listItems = $(listId);

    listItems.children().remove();

    var items = currentRoutine.items;

    if (items.length == 0) {
        listItems.html('');
        listItems.hide();
    } else {
        var oldSequence = items[0].sequence

        listItems.show();
        var html = '';
        items.forEach(function(item) {

            if (item.sequence != oldSequence) {
                listItems.append('<li data-role="list-divider"></li>');
                oldSequence = item.sequence;
            }

            var liText = itemToTextFunction == itemToTextEdit ? '<li data-icon="gear">' : '<li>';
            html += liText + itemToTextFunction(item) + '</li>';
        });
        listItems.html(html);
    }
    listItems.listview('refresh'); // isso supre um bug do jqm
}

function fillItemsListEdit() {
    doFillItemsList('#listEditItems', itemToTextEdit);
}

function fillItemsListShow() {
    doFillItemsList('#listItems', itemToText);
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
    $('#viewRoutineObs').html(currentRoutine.obs);
    if (currentRoutine.obs == '') {
        $('#viewRoutineObs').hide();
    } else {
        $('#viewRoutineObs').show();
    }
    gotoShowRoutinePage();
    fillItemsListShow();
}

function gotoRoutineEditPage() {
    backFunction = gotoMainPage;
    $.mobile.changePage('#editRoutinePage');
    fillItemsListEdit();
}

function doEditRoutine(routine) {
    currentRoutine = routine;

    $('#routineId').val(routine.id);
    $('#inputName').val(routine.name);
    $('#inputObs').val(routine.obs);

    gotoRoutineEditPage();
}

function newRoutine() {
    doEditRoutine({
        id : 0,
        name : '',
        obs : '',
        items : []
    });
}

function editRoutine(id) {
    doEditRoutine(findRoutine(id));
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

function fillIntercalate(ignoreId) {
    var slctIntercalate = $('#slctIntercalate');

    slctIntercalate.empty();
    slctIntercalate.append($('<option />').val(0).text('Não intercalado'));
    currentRoutine.items.forEach(function(element) {
        if (element.id != ignoreId) {
            slctIntercalate.append($('<option />').val(element.id).text(element.exercise));
        }
    });
    slctIntercalate.val(0);
    slctIntercalate.selectmenu().selectmenu('refresh');
}

function checkEnableSeries() {
    if ($('#slctIntercalate').val() == 0) {
        $('#fcSeries').show();
    } else {
        $('#fcSeries').hide();
    }
}

function gotoEditItemPage() {
    backFunction = gotoRoutineEditPage;
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
    fillIntercalate(item.id);
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
    var sequence, series;
    var valIntercalate = $('#slctIntercalate').val();
    if (valIntercalate == 0) {
        // não intercalado
        sequence = $('#inputSequence').val();
        series = $('#inputSeries').val();
    } else {
        // é intercalado
        var intercalatedItem = findItem(valIntercalate);
        sequence = intercalatedItem.sequence;
        series = intercalatedItem.series;
    }

    if (currentItem.id == 0) { // novo exercício
        var items = currentRoutine.items;
        currentItem.id = (0 - items.length) - 1;
        items[items.length] = currentItem;
    }

    currentItem.exercise = toTitleCase($('#inputExercise').val());
    currentItem.equipment = $('#inputEquipment').val();
    currentItem.reps = $('#inputReps').val();
    currentItem.weight = $('#inputWeight').val();
    currentItem.series = series;
    currentItem.sequence = sequence;

    // (re)ordenando conforme a sequencia
    currentRoutine.items.sort(function(a, b) {
        return a.sequence - b.sequence
    });

    gotoRoutineEditPage();
}

function deleteRoutine() {
    routines.splice(indexOfId(routines, currentRoutine.id), 1);
    gotoMainPage();
}

function deleteItem() {
    currentRoutine.items.splice(indexOfId(currentRoutine.items, currentItem.id), 1);
    gotoRoutineEditPage();
}

// **********************

function setValueAutocompleteExercise(value){
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
                q : QUERY_PREFIX+searchText
            },
            success: function(data) {
                // Api returns [ Original Keyword, Searches[] ]
                var results = data[1];
                var html = '';
                results.forEach(function(result) {
                    if(result.indexOf(QUERY_PREFIX) == 0){
                        var resultValue = toTitleCase(result.substring(QUERY_PREFIX.length));
                        html += '<li><a onclick="setValueAutocompleteExercise(`'+resultValue+'`)">' + resultValue + '</a></li>';
                    }
                });

                listView.html(html);
                listView.listview('refresh');
                listView.trigger('updatelayout');
            },
            error: function(jqXHR, textStatus, errorThrown ) {
                //Não conectado?
            } 
        });
    }
}
/*********************
scope.search = function() {
  // If searchText empty, don't search
  if (scope.searchText == null || scope.searchText.length < 1)
    return;

  var url = 'http://suggestqueries.google.com/complete/search?';
  url += 'callback=JSON_CALLBACK&client=firefox&hl=en&q=' 
  url += encodeURIComponent(scope.searchText);
  $http.defaults.useXDomain = true;

  $http({
    url: url,
    method: 'JSONP',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
      'Content-Type': 'application/json',
      'Accept': 'application/json'

    }
  }).
  success(function(data, status, headers, config) {

    // Api returns [ Original Keyword, Searches[] ]
    var results = data[1];
    if (results.indexOf(scope.searchText) === -1) {
      data.unshift(scope.searchText);
    }
    scope.suggestions = results;
    scope.selectedIndex = -1;
  }).
  error(function(data, status, headers, config) {
    console.log('fail');
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
******************/