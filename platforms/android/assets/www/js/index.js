function initIndex() {

    initApp();
    
    $("#frmEditRoutine").validate({
        rules : {
            inputName : {
                required : true
            },
        },
        messages : {
            inputName : {
                required : "Entre com o nome do treino."
            },
        },
        errorPlacement : function(error, element) {
            error.insertAfter(element.parent());
        },
        submitHandler : function(form) {
            saveRoutine();
            return false;
        }
    });

    $("#frmEditItem").validate({
        rules : {
            inputExercise : {
                required : true
            },
            /*** testando sem validação numérica
            inputSeries : {
                digits : true
            },
            inputReps : {
                digits : true
            }
            ***/
        },
        messages : {
            inputExercise : {
                required : "Entre com a descrição do exercício."
            },
            /*** testando sem validação numérica
            inputSeries : {
                digits : "Entre com o número de séries."
            },
            inputReps : {
                digits : "Entre com o número de repetições."
            },
            inputWeight : {
                digits : "Entre com a carga em kg."
            },
            ***/
            inputSequence : {
                digits : "Entre com a sequência.",
                min : 0
            }
        },
        errorPlacement : function(error, element) {
            error.insertAfter(element.parent());
        },
        submitHandler : function(form) {
            saveItem();
            return false;
        }
    });
}

$(document).on("ready", initIndex);
