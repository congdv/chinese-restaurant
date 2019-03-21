$(function(){//document.addEventListener("DOMContentLoaded")
	// document.querySelector("#navbarToggle").addEventListener("blur")
	$("#navbarToggle").blur(function(event){
		var screenWidth = window.innerWidth;
		console.log(screenWidth);
		if(screenWidth < 768){
			$("#collapsable-nav").collapse('hide');
		}
	});

	// In Firefox and Safari, the click event doesn't retain the focus
  // on the clicked button. Therefore, the blur event will not fire on
  // user clicking somewhere else in the page and the blur event handler
  // which is set up above will not be called.
  // Refer to issue #28 in the repo.
  // Solution: force focus on the element that the click event fired on
  $("#navbarToggle").click(function (event) {
    $(event.target).focus();
  });
});

(function (global) {
	var dc ={}; //Namespace

	var homeHTML = "snippets/home-snippet.html";

	var menuCategoriesHTML = "snippets/menu-categories-snippet.html";

	var singleCategoryHTML = "snippets/single-category-snippet.html";

	var menuItemHTML = "snippets/menu-item-snippet.html";

	var categoriesTitleHTML = "snippets/menu-categories-title-snippet.html";

	var menuItemTitleHTML = "snippets/menu-item-title-snippet.html";

	var allCategoriesURL = "https://davids-restaurant.herokuapp.com/categories.json";

	var singeCategoryURL = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";

	// Show loading icon inside element identified by 'selector'.
	var showLoading = function (selector) {
	  var html = "<div class='text-center'>";
	  html += "<img src='images/ajax-loader.gif'></div>";
	  insertHTML(selector, html);
	}

	var switchMenuToActive = function (){
		//Remove active class from home navigation
		var classes = document.querySelector("#navHomeButton").className;
		classes = classes.replace(new RegExp("active","g"),"");
		document.querySelector("#navHomeButton").className = classes;

		// Add 'active' class to menu button if not already there
		classes = document.querySelector("#navMenuButton").className;
		if(classes.indexOf("active") == -1){
			classes +=" active";
			document.querySelector("#navMenuButton").className = classes;
		}
		console.log("ACtive run already");
	}

	//Substitute of {{propertyName}}
	function substitutePropertyValue(string, propName, propValue) {
		var patternToReplace = "{{"+propName+"}}";
		string = string.replace(new RegExp(patternToReplace,"g"),propValue);//g means full match
		return string;
	}

	function insertHTML(selector,html){
		document.querySelector(selector).innerHTML = html;
	}

	//Before load CSS and Image

	document.addEventListener("DOMContentLoaded", function(event){
		// On first load, show home view
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
		homeHTML,
		function (responseText) {
			insertHTML("#main-content",responseText);
		},
		false);

	});

	
	dc.loadMenuCategories = 
		function (){
			showLoading("#main-content");
			// Active menu button
			switchMenuToActive();

			//Read content of menu categories from JSON URL, Using AJax utils to read content of json.
			$ajaxUtils.sendGetRequest(allCategoriesURL, parseJSONValueToHTML);

			// $ajaxUtils.sendGetRequest(
			// 	menuCategoriesHTML,
			// 	function(responseText){
			// 		insertHTML("#main-content",responseText);
			// 	},
			// 	false
			// );
	};

	// Get data from Json file and parsing into HTML Snippet.
	function parseJSONValueToHTML(categoriesJSONResponse){
		showLoading("#main-content");
		//Read Categories title snippet
		$ajaxUtils.sendGetRequest(categoriesTitleHTML,
			function (categoriesTitleHTMLResponse){
				var categoriesItemHTML = "snippets/menu-categories-item-snippet.html";

				$ajaxUtils.sendGetRequest(
					categoriesItemHTML,
					function (categoriesItemResponse) {
						buildHTMLForMenuCategoriesPage(categoriesJSONResponse,
													   categoriesTitleHTMLResponse,
													   categoriesItemResponse);
					},false);
			},
			false);
		
	}

	// Build page from property value
	function buildHTMLForMenuCategoriesPage(categoriesJSONResponse, categoriesTitleHTMLResponse,categoriesItemResponse){
		var menuCategoriesPageHTML = categoriesTitleHTMLResponse;

		// HTML starting Wrapper for menu categories item.
		menuCategoriesPageHTML +='<section class="row">';
		//Read Categories Item snippet
		for(var i = 0; i < categoriesJSONResponse.length; i++){

			//Parse short name to category item snippet
			categoryItemHTML = substitutePropertyValue(categoriesItemResponse,
				                                      "short_name",
				                                      categoriesJSONResponse[i].short_name);

			// console.log(categoriesJSONResponse[i].short_name +" "+categoryItemHTML);

			//Parse name to vategory item snippet
			categoryItemHTML = substitutePropertyValue(categoryItemHTML,//Update to previous substitute
				                                      "name",
				                                      categoriesJSONResponse[i].name);
			// console.log(categoryItemHTML)
			menuCategoriesPageHTML += categoryItemHTML;
		}
		//HTML ending wrapper for menu categories item.
		menuCategoriesPageHTML += '</section>';

		// Insert HTML to opponent in a page.
		insertHTML("#main-content",menuCategoriesPageHTML);
	}

	dc.loadSingleCategory = function (category){
		singeCategoryURL += category;
		console.log(singeCategoryURL);

		$ajaxUtils.sendGetRequest(singeCategoryURL, function (singleCategoryJsonResponse){
			$ajaxUtils.sendGetRequest(
				menuItemHTML,
				function(singleCategoryHTMLResponse){
					console.log(singleCategoryJsonResponse);
					$ajaxUtils.sendGetRequest(
						menuItemTitleHTML,
						function (menuItemTitleHTMLResponse){
							console.log(singleCategoryJsonResponse);
							singleCategoryHTMLPage = buildTitleForSingleCategoryPage(singleCategoryJsonResponse.category,menuItemTitleHTMLResponse);

							singleCategoryHTMLPage += buildSingleCategoryPage(category,
					                                                 singleCategoryJsonResponse,
					                                                 singleCategoryHTMLResponse);

							insertHTML("#main-content",singleCategoryHTMLPage);
						},
						false)
				},
			false
			);
			
		})

		
	};

	function getPriceHTML(priceSmall, smallPortionName, priceLarge, largePortionName){
		var html = "";
		if(priceSmall){
			html+="$"+priceSmall
			if(smallPortionName){
				html+= "<span>"+ smallPortionName+"</span>"
			}
		}
		if(priceLarge){
			html+= "$"+priceLarge;
			if(largePortionName){
				html+= "<span>"+ largePortionName+"</span>"
			}
		}

		return html;
	}

	function buildTitleForSingleCategoryPage(category,menuItemTitleHTMLResponse ){
		console.log(category);
		menuItemTitleHTMLResponse = substitutePropertyValue(menuItemTitleHTMLResponse,"name",category.name);
		menuItemTitleHTMLResponse = substitutePropertyValue(menuItemTitleHTMLResponse,"special_instructions",category.special_instructions);
		return menuItemTitleHTMLResponse;
	}

	function buildSingleCategoryPage(category, singleCategoryJsonResponse,singleCategoryHTMLResponse){
		var HTMLPage = "";

		HTMLPage += '<section class="row">';
		var menuItems = singleCategoryJsonResponse.menu_items;
		for(var i = 0; i < menuItems.length; i++){
			var singleCategoryItemHTML = substitutePropertyValue(singleCategoryHTMLResponse,"category",category);
			singleCategoryItemHTML = substitutePropertyValue(singleCategoryItemHTML,"short_name",menuItems[i].short_name);
			singleCategoryItemHTML = substitutePropertyValue(singleCategoryItemHTML,"name",menuItems[i].name);

			var priceHTML = getPriceHTML(menuItems[i].price_small,menuItems[i].small_portion_name,menuItems[i].price_large,menuItems[i].large_portion_name);

			singleCategoryItemHTML = substitutePropertyValue(singleCategoryItemHTML,"price",priceHTML);
			singleCategoryItemHTML = substitutePropertyValue(singleCategoryItemHTML,"description",menuItems[i].description);

			// console.log(singleCategoryItemHTML);
			if(i % 2 == 1){
				singleCategoryItemHTML+='<div class="clearfix visible-md block visible-lg-block"></div>';
			}
			HTMLPage += singleCategoryItemHTML;
		}

		HTMLPage += '</section>';
		return HTMLPage;
	}


	
	
	window.$dc = dc; // Expose namespace become a property of window.

})(window);