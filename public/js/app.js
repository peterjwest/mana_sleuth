$(function() {

  // Set up stylish select boxes
  var initialisePage = function(page) {
    page.find("select").chosen({
      disable_search_threshold: 5,
      no_results_text: "No formats called",
      allow_single_deselect: true
    });
  }

  // Run any initialisation on page load
  initialisePage($("body"));

  // Sets up push state history for AJAX links
  $('.xhr').live('click', function() {
    var self = $(this);
    if (self.is("a")) var url = self.attr('href');
    if (self.is("input[type=submit]")) var url = "?"+self.closest("form").serialize();
    var state = window.History.getState();
    console.log(url);
    console.log(state);
    window.History.pushState(self.data('history'), "", url);
    return false;
  });

  //Monitor state changes for Back request
  window.History.Adapter.bind(window, 'statechange', function() {
    var state = window.History.getState();
    var url = state.url;

    //Add the xhr param (allows for caching + doesn't clash with 'full' pages)
    url += (url.match(/\\\?/) ? '?' : '&') + 'xhr=true';

    //jQuery Cache bug fix
    url = url.replace("?&", "?");

    $('#content').load(url, function(response, status) {
      initialisePage($(this));
      if(window._gaq) window._gaq.push(['_trackPageview']);
    });
  });

});
