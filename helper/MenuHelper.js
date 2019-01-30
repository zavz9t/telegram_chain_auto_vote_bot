'use strict';

/**
 * @property {string} BUTTON_RUN Main menu button which runs bot to curate new posts
 * @property {string} BUTTON_STOP Main menu button which stops bot from upvoting new posts
 * @property {string} BUTTON_SETTINGS Main menu button which displays user settings
 * @property {string} BUTTON_INFORMATION Main menu button which displays information about bot
 * @property {string} BUTTON_FAVORITES Main menu button which displays/configure list of favorite users to curate
 * @property {string} BUTTON_CURATORS Main menu button which displays/configure list of curators to copy upvotes
 * @property {string} BUTTON_GO_BACK Button which leads to previous menu
 * @property {string} BUTTON_SETTINGS_WEIGHT Button at Settings section to change upvote weight
 * @property {string} BUTTON_SETTINGS_MIN_VP Button at Settings section to change minimum VP to stop upvoting
 */
class MenuHelper {

    /**
     * Returns list of buttons at main menu
     * @return {Array}
     */
    static getMainMenuButtons() {
        return [
            [this.BUTTON_STOP, this.BUTTON_SETTINGS, this.BUTTON_RUN],
            [this.BUTTON_CURATORS, this.BUTTON_INFORMATION, this.BUTTON_FAVORITES],
        ];
    }

    /**
     * Returns list of buttons at Settings section
     * @return {Array}
     */
    static getSettingsMenuButtons() {
        return [
            [this.BUTTON_SETTINGS_WEIGHT, this.BUTTON_SETTINGS_MIN_VP],
            [this.BUTTON_GO_BACK],
        ];
    }
}

MenuHelper.BUTTON_RUN = `🚀 Run`;
MenuHelper.BUTTON_STOP = `🛑 Stop`;
MenuHelper.BUTTON_SETTINGS = `⚙️ Settings`;
MenuHelper.BUTTON_INFORMATION = `ℹ️ Information`;
MenuHelper.BUTTON_CURATORS = `🏃 Curators`;
MenuHelper.BUTTON_FAVORITES = `⭐ Favorites`;
MenuHelper.BUTTON_GO_BACK = `🔙 Go back`;
MenuHelper.BUTTON_SETTINGS_WEIGHT = `💯 Upvote weight`;
MenuHelper.BUTTON_SETTINGS_MIN_VP = `📉 Minimum VP`;

module.exports = MenuHelper;
