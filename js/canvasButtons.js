
document.addEventListener("DOMContentLoaded", function () {
    $('#trash').on('click',function(e){
        deleteObjects();
    });
    $(document).keydown(function (e) {
        if (e.keyCode === 46) {
            deleteObjects();
        }
    });
    $('#edit').on('click',function(e){
        editText();
    });
    $('#duplicate').on('click',function(e){
        duplicateObjects();
    });
    $('#clear').on('click',function(e){
        clearCanvas();
    });
    $('#save').on('click',function(e){
        saveImg();
    });
    $('#notes').on('click',function(e){
        openNotes();
    });
    $('#close-notes').on('click',function(e){
        closeNotes();
    });
});

function deleteObjects() {
    var activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
        if(activeObject.type === 'group') {
            deleteGroup(activeObject)
        } else if(activeObject.type === 'activeSelection') {
            // delete each group in selection
            var groups = activeObject.getObjects();
            groups.forEach(function (object) {
                if(object.type === 'group') {
                    deleteGroup(object)
                } else {
                    fabricCanvas.remove(object);
                }
            });
        } else if(activeObject.type === 'image') {
            fabricCanvas.remove(activeObject);
        }
        fabricCanvas.discardActiveObject();
    }
}

function deleteGroup(activeObject){
    // remove objects in group
    var objectsInGroup = activeObject.getObjects();
    objectsInGroup.forEach(function (object) {
        fabricCanvas.remove(object);
    });
    // remove group
    fabricCanvas.remove(activeObject);
}

function duplicateObjects(){
    var activeObject = fabricCanvas.getActiveObject();
    if(activeObject && activeObject.type !== 'i-text') {
        activeObject.clone(function (clonedObject) {
            fabricCanvas.discardActiveObject();
            clonedObject.set({
                left: clonedObject.left + 10,
                top: clonedObject.top + 10
            });
            if (clonedObject.type === 'activeSelection') {
                // active selection needs a reference to the canvas.
                clonedObject.canvas = fabricCanvas;
                clonedObject.forEachObject(function (obj) {
                    fabricCanvas.add(obj);
                });
                // this should solve the unselectability
                // clonedObject.setCoords();
            } else {
                fabricCanvas.add(clonedObject);
            }
            fabricCanvas.setActiveObject(clonedObject);
            fabricCanvas.requestRenderAll();
        });
    }
}

function clearCanvas() {
    fabricCanvas.clear();
    addCanvasGrid();
    snapToGrid();
}

function saveImg(){
    var pdfDoc = new jsPDF({orientation: 'landscape', unit: 'in'});

    var title = $('#title-input').val();
    if(!title){
        title = "Stage Diagram";
    }
    pdfDoc.setFontSize(25);
    pdfDoc.text(0.75, 0.75, title);
    var notes = $('#notes-area').val();
    if(notes) {
        pdfDoc.setFontSize(15);
        pdfDoc.text(0.75, 6.25, "Notes:");
        pdfDoc.setFontSize(12);
        pdfDoc.text(0.75, 6.5, notes, {maxWidth: 10});
    }
    //get canvas size and crop image
    var canvasURL = fabricCanvas.toDataURL('png');
    pdfDoc.addImage(canvasURL, 'JPEG', 0.75, 1, 8.88, 5);
    // add stage bottom
    var image = $('#stage-front')[0];
    pdfDoc.addImage(image, 'JPEG', 0.75, 4, 8.88, 2);
    pdfDoc.save(title.replace(" ", "") + 'SD.pdf');
}

function openNotes(){
    var main = $('#main');
    $('#right')[0].style.display = "initial";
    main.css("grid-template-columns", "262px auto 260px");
}

function closeNotes(){
    var main = $('#main');
    $('#right')[0].style.display = "none";
    main.css("grid-template-columns", "262px auto 0");
}