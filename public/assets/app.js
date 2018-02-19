function shownote(event) {
    event.preventDefault();
    let id = $(this).attr("value");
    $("#addnote").on("show.bs.modal");
    $("#add-note").attr("value", id);
    $.get("/" + id, function (data) {
        $("#article-title").text(data.title);
        $.get("/note/" + id, function (data) {
            if (data) {
                $("#note-title").val(data.title);
                $("#note-body").val(data.body);
            }
        });
    });
}


function addnote(event) {
    event.preventDefault();
    let id = $(this).attr("value");
    let obj = {
        title: $("#note-title").val().trim(),
        body: $("#note-body").val().trim()
    };
    $.post("/note/" + id, obj, function (data) {
        window.location.href = "/saved";
    });
}

function changestatus() {
    let status = $(this).attr("value");
    if (status === "Saved") {
        $(this).html("Unsave");
    }
};

function changeback() {
    $(this).html($(this).attr("value"));
}

$(document).on("click", ".addnote-button", shownote);
$(document).on("click", "#add-note", addnote);
$(".status").hover(changestatus, changeback);
$("#close-note").on("click", function () {
    $("#addnote").fadeOut(300);
});

// $('#exampleModal').on('show.bs.modal', function (event) {
//     var button = $(event.relatedTarget) // Button that triggered the modal
//     var recipient = button.data('whatever') // Extract info from data-* attributes
//     // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
//     // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
//     var modal = $(this)
//     modal.find('.modal-title').text('New message to ' + recipient)
//     modal.find('.modal-body input').val(recipient)
//   })