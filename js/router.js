/* 
 * Web Engineering WS 20/21
 * Semsterprojekt SPA "Blogger"
 * Gruppe 12
 * Simon Nunez Aschenbrenner (908606)
 */

"use strict";

const router = (function () {

    // Private Variable
    let mapRouteToHandler = new Map();

    // Oeffentliche Methoden
    return {

        // Fügt eine neue Route (URL, auszuführende Funktion) zu der Map hinzu
        addRoute(route, handler) {
            mapRouteToHandler.set(route, handler);
        },

        // Wird aufgerufen, wenn zu einer anderen Adresse navigiert werden soll
        navigateToPage(url) {
            history.pushState(null, "", url);
            this.handleRouting();
        },

        // Wird aufgerufen, wenn zur vorherigen Seite navigiert werden soll.
        goBack() {
            history.back();
        },

        // Wird als Eventhandler an ein <a>-Element gebunden
        handleNavigationEvent(event) {
            event.preventDefault();
            let url = event.target.href;
            this.navigateToPage(url);
        },

        // Wird als EventHandler aufgerufen, sobald die Pfeiltasten des Browsers betätigt werden
        handleRouting() {
            console.log("router.handleRouting(): " + window.location.pathname);
            const currentPage = window.location.pathname.split("/")[1];
            let routeHandler = mapRouteToHandler.get(currentPage);
            if (routeHandler === undefined)
                routeHandler = mapRouteToHandler.get(""); // Startseite
            routeHandler(window.location.pathname);
        }
    };
})();

// Selbsaufrufende Funktionsdeklaration: (function name(){..} ) ();
(function initRouter() {

    // Startpage
    router.addRoute("", function () {
        presenter.showStartPage();
    });

    router.addRoute("blogs", function (url) {
        let bid = url.split("/blogs/")[1];
        if (bid != undefined && bid != "") presenter.showBlogSummary(bid);
        else presenter.showStartPage();
    });

    router.addRoute("posts", function (url) {
        let id = url.split("/posts/")[1];
        let bid = id.split("/")[0];
        let pid = id.split("/")[1];
        presenter.showPostDetail(bid, pid);
    });

    router.addRoute("edit", function (url) {
        let id = url.split("/edit/")[1];
        let bid = id.split("/")[0];
        let pid = id.split("/")[1];

        if (pid) {
            presenter.showEdit(bid, pid);
        } else {
            presenter.showAdd(bid);
        }
    })

    if (window) {
        window.addEventListener("popstate", (event) => {
            router.handleRouting();
        });
        router.handleRouting();
    }

})();
