/* exported gMenuPane */
"use strict";

var gMenuPane = {
  init() {
    MozXULElement.insertFTLIfNeeded("browser/menubar.ftl");
    MozXULElement.insertFTLIfNeeded("browser/tabContextMenu.ftl");
    MozXULElement.insertFTLIfNeeded("browser/preferences/preferences.ftl");
    const i10IdMap = {
      "tab-context-open-in-container": "reopen-in-container",
      "tab-context-reopen-closed-tabs": "tab-context-undo-close-tabs",
      "tab-context-open-in-new-container-tab": "tab-context-open-in-container"
    };
    Tabmix.setFTLDataId(
      "paneMenu",
      l10Id => !Tabmix.isVersion(880) && i10IdMap[l10Id] || l10Id
    );

    $("pinTab").label = gPrefWindow.pinTabLabel;
    $("togglePinTab").setAttribute("label", gPrefWindow.pinTabLabel);
    $("clearClosedTabs").setAttribute("label", TabmixSvc.getString("undoclosetab.clear.label"));

    var browserWindow = Tabmix.getTopWin();
    let $$ = id => browserWindow.document.getElementById(id);

    $("muteTab").label = browserWindow.gNavigatorBundle.getString("muteTab.label") + "/" +
        browserWindow.gNavigatorBundle.getString("unmuteTab.label");

    // if Tabview exist copy its menu label
    let tabViewMenu = browserWindow.TMP_TabView.installed &&
        ($$("context_tabViewMenu") || $$("tabGroups-context_tabViewMenu"));
    if (tabViewMenu) {
      $("moveToGroup").label = tabViewMenu.getAttribute("label");
    } else {
      gPrefWindow.removeChild("pref_showMoveToGroup");
      gPrefWindow.removeChild("moveToGroup");
    }

    $("sendTabToDevice").label = browserWindow.PluralForm.get(
      1,
      browserWindow.gNavigatorBundle.getString("sendTabsToDevice.label")
    );

    this.setInverseLinkLabel();

    if (!Shortcuts.keys.browserReload.id)
      $("browserReload").hidden = true;
    this.initializeShortcuts();
    this.updateSessionShortcuts();
    this.setSlideShowLabel();
    let paneMenu = $("paneMenu");
    if (paneMenu.hasAttribute("editSlideShowKey")) {
      paneMenu.removeAttribute("editSlideShowKey");
      setTimeout(() => this.editSlideShowKey(), 0);
    }

    gPrefWindow.initPane("paneMenu");
  },

  initializeShortcuts() {
    if (Shortcuts.prefsChangedByTabmix)
      return;

    let newValue = $("pref_shortcuts").value;
    let shortcuts = $("shortcut-group");
    if (newValue == shortcuts.value)
      return;
    shortcuts.value = newValue;
    shortcuts.keys = TabmixSvc.JSON.parse(newValue);
    let callBack = shortcut => shortcut.id && shortcut.valueFromPreferences(Shortcuts.keys[shortcut.id]);
    this.updateShortcuts(shortcuts, callBack);
  },

  _slideShow: "",
  updateShortcuts(aShortcuts, aCallBack) {
    let boxes = Array.prototype.filter.call(aShortcuts.childNodes, aCallBack);
    $("shortcuts-panel").setAttribute("usedKeys", boxes.length > 0);
    if (this._slideShow != $("shortcut-group").keys.slideShow) {
      this._slideShow = $("shortcut-group").keys.slideShow;
      this.setSlideShowLabel();
    }
  },

  setSlideShowLabel() {
    let slideShow = $("slideShow");
    let label = slideShow.disabled ? "??" : getFormattedKey(slideShow.key);
    $("slideDelayLabel").value = slideShow.getAttribute("_label").replace("#1", label);
    gPrefWindow.setDisabled("obs_slideDelay", slideShow.disabled);
  },

  editSlideShowKey() {
    $("menu").selectedIndex = 3;
    let slideShow = $("slideShow");
    let item = $("hide-unused-shortcuts");
    if (!slideShow.hasAttribute("value") &&
        $("shortcuts-panel").getAttribute(item.id) == "true")
      this.toggleLinkLabel(item);
    slideShow.editBox.focus();
    let shortcuts = $("shortcut-group");
    shortcuts.scrollTop = shortcuts.scrollHeight - shortcuts.clientHeight;
  },

  updateSessionShortcuts() {
    let block = !($("pref_sessionManager") || $("pref_sessionManager1")).value ||
        Shortcuts.permanentPrivateBrowsing;
    $("saveWindow").blocked = block;
    $("saveSession").blocked = block;
  },

  // for shortcuts panel
  toggleLinkLabel(item) {
    var panel = $("shortcuts-panel");
    var wasShow = panel.getAttribute(item.id) == 'false';
    item.value = item.getAttribute(wasShow ? 'show' : 'hide');
    panel.setAttribute(item.id, wasShow);
  },

  // update item showInverseLink label in menu pane
  // when "Links" in Events > Tab Focus changed
  setInverseLinkLabel() {
    var showInverseLink = $("showInverseLink");
    var val = ($("pref_selectTab") || $("pref_selectTab1")).value;
    var label = showInverseLink.getAttribute((val ? "bg" : "fg") + "label");
    showInverseLink.setAttribute("label", label);
  }
};
