var routines;

function initApp() {
    routines = JSON.parse(localStorage.getItem("routines"));
    if (routines == null) {
        routines = [];
    }

    fillRoutinesSelection(false);
}

function saveRoutines() {
    localStorage.setItem("routines", JSON.stringfy(routines));
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
        $("#aNewItem").show();
        $("#aEditRoutine").show();
    }
}

function newRoutine() {
    $("#routineId").val("0"); // novo treino
    $("#inputName").val("");

    $.mobile.changePage("#divEditRoutinePage");
}

function editRoutine() {
    var routineId = $("#slctRoutines").val();

    routines.every(function(item) {
        if (item.id == routineId) {
            $("#routineId").val(routineId);
            $("#inputName").val(item.name);
            return false;
        } else {
            return true;
        }
    });

    $.mobile.changePage("#divEditRoutinePage");
}

function findRoutine(routineId) {
    return routines.find(function(element) {
        return element.id == routineId;
    });
}

function saveRoutine() {
    var routineId = $("#routineId").val();
    var routineName = $("#inputName").val().trim();

    if (routineId == 0) {// novo treino
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

    fillRoutinesSelection(routineId);

    $.mobile.changePage("#divMainPage");
}

function currentRoutine() {
    var routineId = $("#slctRoutines").val();
    return findRoutine(routineId);
}

function showItems() {
    var itemsContainer = $("#itemsContainer");
    itemsContainer.empty();

    var items = currentRoutine().items;
    items.forEach(function(element) {
        // itemsContainer.append("<tr><td>"+element.exercise+"</td><td>"+element.equipment+"</td><td>"+element.series+"</td><td>"+element.reps+"</td></tr>");
        
        var strItem='<li><a onclick="editItem(' + element.itemId + ')"><h4>' + element.exercise + '</h4></a>';
        if(element.equipment){
            strItem+=' ['+element.equipment+'] ';
        }
        if(element.series){
            strItem+=' '+element.series;
        }
        if(element.reps){
            strItem+=' X '+element.reps;
        }
        
        strItem+='</li>';
        
        itemsContainer.append(strItem);
    });
    
    $("#aNewItem").show();
    $("#aEditRoutine").show();
}

function newItem() {
    $("#itemId").val("0"); // novo exercício
    $("#inputExercise").val("");
    $("#inputEquipment").val("");
    $("#inputSeries").val("");
    $("#inputReps").val("");

    $.mobile.changePage("#divEditItemPage");
}

function findItem(itemId){
    return currentRoutine().items.find(function(element){
        return element.itemId == itemId;
    });
}

function editItem(itemId) {
    var item=findItem(itemId);
    
    $("#itemId").val(itemId); // novo exercício
    $("#inputExercise").val(item.exercise);
    $("#inputEquipment").val(item.equipment);
    $("#inputSeries").val(item.series);
    $("#inputReps").val(item.reps);

    $.mobile.changePage("#divEditItemPage");
}

function saveItem() {
    if ($("#itemId").val() == 0) { // novo exercício
        var items = currentRoutine().items;
        var itemId = (0 - items.length) - 1;
        items[items.length] = {
            itemId : itemId,
            exercise : $("#inputExercise").val(),
            equipment : $("#inputEquipment").val(),
            series : $("#inputSeries").val(),
            reps : $("#inputReps").val()
        };
    } else {
        var item=findItem($("#itemId").val());
        item.exercise = $("#inputExercise").val();
        item.equipment = $("#inputEquipment").val();
        item.series = $("#inputSeries").val();
        item.reps = $("#inputReps").val();
    }

    showItems();
    $.mobile.changePage("#divMainPage");
}
