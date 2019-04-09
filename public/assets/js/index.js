/*global bootbox*/
$(document).ready(function() {
  // Adding event listeners 
  var articleContainer = $(".article-container");
  $(document).on("click", ".btn.save", handleArticleSave);
  $(document).on("click", ".scrape-new", handleArticleScrape);

  initPage();

  function initPage() {
    articleContainer.empty();
    $.get("/articles").then(function(data) {
      // If we have headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
      }
      else {
        // Otherwise render a message explaing we have no articles
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    var articleCards = [];
    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createCard(articles[i]));
    }
    articleContainer.append(articleCards);
  }

  function createCard(article) {
    var card = $(
      [
        "<div class='card card-default'>",
        "<div class='card-heading'>",
        "<h3>",
        "<a class='article-link' target='_blank' href='" + article.url + "'>",
        article.article,
        "</a>",
        "<a class='btn btn-success save'>",
        "Save Article",
        "</a>",
        "</h3>",
        "</div>",
        "<div class='card-body'>",
        article.summary,
        "</div>",
        "</div>"
      ].join("")
    );
    card.data("_id", article._id);
    return card;
  }

  function renderEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Looks like we don't have any new articles.</h4>",
        "</div>",
        "<div class='card card-default'>",
        "<div class='card-heading text-center'>",
        "<h3>What Would You Like To Do?</h3>",
        "</div>",
        "<div class='card-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    articleContainer.append(emptyAlert);
  }

  function handleArticleSave() {
    var articleToSave = $(this)
      .parents(".card")
      .data();
    articleToSave.saved = true;
    $.ajax({
      method: "PUT",
      url: "/articles/save/" + articleToSave._id,
      data: articleToSave
    }).then(function(data) {
      if (data.saved) {
        initPage();
      }
    });
  }

  function handleArticleScrape() {
    $.get("/scrape").then(function(data) {
      initPage();
      // bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>");
    });
  }
});