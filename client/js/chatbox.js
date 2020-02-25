$(document).ready(function()
{
    $("#chatBox").hide();

    $("#chatLink").click(function()
    {
        $("#chatBox").fadeToggle(300);
        return false;
    });

    //Document Click hiding the popup
    $(document).click(function()
    {
        $("#chatBox").hide();
    });

    //Minimize
    $("#chatClose").click(function()
    {
        $("#chatBox").hide();
    });

    //Popup on click
    $("#chatBox").click(function()
    {
        return false;
    });

});