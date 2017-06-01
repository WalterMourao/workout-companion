var routines;

function doSaveRoutines() {
    window.localStorage.setItem("routines", JSON.stringify(routines));
}

function initApp() {
    routines = JSON.parse(window.localStorage.getItem("routines"));
    if (routines == null) {
        routines = [];
    }

    fillRoutinesSelection(false);
}

function findId(arr, id){
    for(index in arr){
        if(arr[index].id == id){
            return arr[index];
        }
    }
    return null;
}

function fillRoutinesSelection(selectedId) {
    var slctRoutine = $("#slctRoutines");

    slctRoutine.empty();

    routines.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });

    // slctRoutine.append("<option value='0'>Selecione um treino</option>");
    routines.forEach(function(element) {
        slctRoutine.append($("<option />").val(element.id).text(element.name));
    });

    if (selectedId) {
        slctRoutine.val(selectedId);
        slctRoutine.selectmenu("refresh");
        $("#btNewItem").show();
        $("#btEditRoutine").show();
    }
}

function newRoutine() {
    $("#routineId").val("0"); // novo treino
    $("#inputName").val("");

    $.mobile.changePage("#editRoutinePage");
}

function editRoutine() {
    var routine = currentRoutine();

    $("#routineId").val(routine.id);
    $("#inputName").val(routine.name);

    $.mobile.changePage("#editRoutinePage");
}

function findRoutine(routineId) {
    return findId(routines, routineId);
}

function saveRoutine() {
    var routineId = $("#routineId").val();
    var routineName = $("#inputName").val().trim();

    if (routineId == "0") {// novo treino
        routineId = (0 - routines.length) - 1;
        routines[routines.length] = {
                id : routineId,
                name : routineName,
                items : [] 
        };
        itemsContainer = $("#itemsContainer").empty();
    } else {
        var routine = findRoutine(routineId);
        routine.name = routineName;
    }

    doSaveRoutines();
    
    fillRoutinesSelection(routineId);

    $.mobile.changePage("#mainPage");
}

function currentRoutine() {
    var routineId = $("#slctRoutines").val();
    return findRoutine(routineId);
}

function showItems() {
    var itemsContainer = $("#itemsContainer");
    itemsContainer.empty();

    var colors = [];
    colors[true]='#e6ffe6';
    colors[false]='#ffffe6';
    var bkColorIdx=true;
    var oldSequence=-1;
    
    var items = currentRoutine().items;
    items.forEach(function(element) {
        // itemsContainer.append("<tr><td>"+element.exercise+"</td><td>"+element.equipment+"</td><td>"+element.series+"</td><td>"+element.reps+"</td></tr>");
        
        if(element.sequence != oldSequence){
            bkColorIdx = !bkColorIdx;
            oldSequence = element.sequence; 
        }
        
        var strItem='<li style="background-color: '+colors[bkColorIdx]+'"><a onclick="editItem(' + element.id + ')"><h4>' + element.sequence+' - '+element.exercise + '</h4></a>'
        
        if(element.equipment){
            strItem+=' Eqpto: '+element.equipment;saveIte
        }
        if(element.series){
            strItem+=' '+element.series;
            if(element.reps){
                strItem+=' X';
            }
        }
        if(element.reps){
            strItem+=' '+element.reps;
        }
        if(element.weight){
            strItem+=' Carga: '+element.weight;
        }
        
        strItem+='</li>';
        
        itemsContainer.append(strItem);
    });
    
    $("#btNewItem").show();
    $("#btEditRoutine").show();
}

function nextSequence(){
    var items = currentRoutine().items;
    return (items.length == 0)? 1: parseInt(items[items.length-1].sequence)+1;
}

function newItem() {
    $("#itemId").val("0"); // novo exercício
    $("#inputExercise").val("");
    $("#inputEquipment").val("");
    $("#inputSeries").val("");
    $("#inputReps").val("");
    $("#inputWeight").val("");
    $("#inputSequence").val(nextSequence());

    $.mobile.changePage("#editItemPage");
}

function findItem(itemId){
    var items = currentRoutine().items;
    return findId(items,itemId);
}

function editItem(itemId) {
    var item=findItem(itemId);
    
    $("#itemId").val(itemId);
    $("#inputExercise").val(item.exercise);
    $("#inputEquipment").val(item.equipment);
    $("#inputSeries").val(item.series);
    $("#inputReps").val(item.reps);
    $("#inputWeight").val(item.weight);
    $("#inputSequence").val(item.sequence);

    $.mobile.changePage("#editItemPage");
}

function saveItem() {
    if ($("#itemId").val() == 0) { // novo exercício
        var items = currentRoutine().items;
        var itemId = (0 - items.length) - 1;
        items[items.length] = {
            id : itemId,
            exercise : $("#inputExercise").val(),
            equipment : $("#inputEquipment").val(),
            series : $("#inputSeries").val(),
            reps : $("#inputReps").val(),
            weight : $("#inputWeight").val(),
            sequence : $("#inputSequence").val(),
        };
    } else {
        var item=findItem($("#itemId").val());
        item.exercise = $("#inputExercise").val();
        item.equipment = $("#inputEquipment").val();
        item.series = $("#inputSeries").val();
        item.reps = $("#inputReps").val();
        item.weight = $("#inputWeight").val();
        item.sequence = $("#inputSequence").val();
    }
    
    //(re)ordenando conforme a sequencia
    currentRoutine().items.sort(function(a, b){return a.sequence-b.sequence});

    doSaveRoutines();
    
    showItems();
    $.mobile.changePage("#mainPage");
}
