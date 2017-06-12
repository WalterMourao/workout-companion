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

    if(routines.length == 0){
        slctRoutine.append($("<option />").val(0).text("Nenhum treino foi criado"));
        slctRoutine.val(0);
    } else {
        routines.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });

        // slctRoutine.append("<option value='0'>Selecione um treino</option>");
        routines.forEach(function(element) {
            slctRoutine.append($("<option />").val(element.id).text(element.name));
        });

        $("#btNewItem").show();
        $("#btEditRoutine").show();

        slctRoutine.val(selectedId? selectedId: routines[0].id);
        showSelectedRoutine();
    }

    slctRoutine.selectmenu().selectmenu("refresh");
}

function newRoutine() {
    $("#routineId").val("0"); // novo treino
    $("#inputName").val("");
    $("#inputObs").val("");

    $.mobile.changePage("#editRoutinePage");
}

function editRoutine() {
    var routine = getCurrentRoutine();

    $("#routineId").val(routine.id);
    $("#inputName").val(routine.name);
    $("#inputObs").val(routine.obs);

    $.mobile.changePage("#editRoutinePage");
}

function findRoutine(routineId) {
    return findId(routines, routineId);Id
}

function saveRoutine() {
    var routineId = $("#routineId").val();
    var routineName = $("#inputName").val().trim();
    var routineObs = $("#inputObs").val().trim();

    if (routineId == "0") {// novo treino
        routineId = (0 - routines.length) - 1;
        routines[routines.length] = {
                id : routineId,
                name : routineName,
                obs : routineObs,
                items : [] 
        };
        itemsContainer = $("#itemsContainer").empty();
    } else {
        var routine = findRoutine(routineId);
        routine.name = routineName;
        routine.obs = routineObs;
    }

    doSaveRoutines();
    
    fillRoutinesSelection(routineId);

    $.mobile.changePage("#mainPage");
}

function getCurrentRoutine() {
    var routineId = $("#slctRoutines").val();
    return findRoutine(routineId);
}

function showSelectedRoutine() {
    
    var currentRoutine = getCurrentRoutine();
    
    if(currentRoutine){
        $('#routineRest').text(currentRoutine.rest);
        $('#routineObs').text(currentRoutine.obs);
        if(currentRoutine.obs == ''){
            $('#routineObs').hide();
        } else {
            $('#routineObs').show();
        }
        
        var itemsContainer = $("#itemsContainer");
        itemsContainer.empty();
    
        var colors = [];
        colors[true]='#e6ffe6';
        colors[false]='#ffffe6';
        var bkColorIdx=true;
        var oldSequence=-1;
        
        currentRoutine.items.forEach(function(element) {
            // itemsContainer.append("<tr><td>"+element.exercise+"</td><td>"+element.equipment+"</td><td>"+element.series+"</td><td>"+element.reps+"</td></tr>");
            
            if(element.sequence != oldSequence){
                bkColorIdx = !bkColorIdx;
                oldSequence = element.sequence; 
            }
            
            var strItem='<li style="background-color: '+colors[bkColorIdx]+'"><a onclick="editItem(' + element.id + ')"><h4>' + element.sequence+' - '+element.exercise + '</h4></a>'
            
            if(element.equipment){
                strItem+=' Eqpto: '+element.equipment;
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
}

function nextSequence(){
    var items = getCurrentRoutine().items;
    return (items.length == 0)? 1: parseInt(items[items.length-1].sequence)+1;
}

function fillIntercalate(ignoreId){
    var slctIntercalate = $("#slctIntercalate");

    slctIntercalate.empty();
    slctIntercalate.append($("<option />").val(0).text("Não intercalado"));
    getCurrentRoutine().items.forEach(function(element) {
        if(element.id != ignoreId){
            slctIntercalate.append($("<option />").val(element.id).text(element.exercise));
        }
    });
    slctIntercalate.val(0);
    slctIntercalate.selectmenu().selectmenu("refresh");
}
    
function checkEnableSeries(){
    if($("#slctIntercalate").val() == 0){
        $("#fcSeries").show();
    } else {
        $("#fcSeries").hide();
    }
}

function newItem() {
    $("#itemId").val("0"); // novo exercício
    $("#inputExercise").val("");
    $("#inputEquipment").val("");
    $("#inputSeries").val("");
    $("#inputReps").val("");
    $("#inputWeight").val("");
    $("#inputSequence").val(nextSequence());

    fillIntercalate();
    
    $.mobile.changePage("#editItemPage");
}

function findItem(itemId){
    var items = getCurrentRoutine().items;
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

    fillIntercalate(itemId);

    $.mobile.changePage("#editItemPage");
}

function saveItem() {
    var sequence, series;
    var valIntercalate = $("#slctIntercalate").val();
    if(valIntercalate == 0){ 
        //não intercalado
        sequence = $("#inputSequence").val();
        series = $("#inputSeries").val();
    } else {
        //é intercalado
        var intercalatedItem=findItem(valIntercalate);
        sequence = intercalatedItem.sequence;
        series = intercalatedItem.series;
    }
    
    var item; 
        
    if ($("#itemId").val() == 0) { // novo exercício
        var items = getCurrentRoutine().items;
        var itemId = (0 - items.length) - 1;
        item = {id : itemId};
        items[items.length] = item; 
    } else {
        item=findItem($("#itemId").val());
    }
    
    item.exercise = $("#inputExercise").val();
    item.equipment = $("#inputEquipment").val();
    item.reps = $("#inputReps").val();
    item.weight = $("#inputWeight").val();
    item.series = series;
    item.sequence = sequence;

    //(re)ordenando conforme a sequencia
    getCurrentRoutine().items.sort(function(a, b){return a.sequence-b.sequence});

    doSaveRoutines();
    
    showSelectedRoutine();
    $.mobile.changePage("#mainPage");
}
