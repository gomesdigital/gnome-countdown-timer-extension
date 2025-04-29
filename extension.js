/**
 * Time is of the essence.
 *
 * This is a general purpose timer that counts down instead of up.
 * Put an emoji in the ./schemas/org.gnome.shell.extensions.gnomecountdowntimerextension.gschema.xml
 * file and a target date. Then connect with your mortality, human.
*/
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class GnomeCountdownTimerExtension extends Extension {
    /**
     * Initalize the app by defining the UI and starting a timer to periodically
     * refresh it.
     */
    enable() {
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        
        // Settings from XML file in ./schemas.
        this._settings = this.getSettings();
        const icon = this._settings.get_string('icon');
        
        this._label = new St.Label({
            text: `${icon}`,
            y_align: Clutter.ActorAlign.CENTER
        });
        this._indicator.add_child(this._label);
        
        this._toggle = new PopupMenu.Switch(this._settings.get_boolean('hide'));
        this._menuItem = new PopupMenu.PopupSwitchMenuItem(_('Hide'), this._toggle.state);
        
        // Get the target date from settings.
        const targetDateString = this._settings.get_string('target-date');
        const targetDate = this._parseTargetDate(targetDateString);
        
        // Configure showing and hiding.
        this._menuItem.connect('toggled', (_, state) => {
            this._settings.set_boolean('hide', state);
            if (state) {
                this._label.set_text(icon);
            } else {
                this._refresh(targetDate);
            }
        });
        this._indicator.menu.addMenuItem(this._menuItem);
        
        this._refresh(targetDate);
        
        // Set up periodic refresh to run on the passing of each day.
        this._setupMidnightRefresh(targetDate);
        
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }
    
    /**
     * Gracefully tear down the app.
     */
    disable() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
        
        this._indicator?.destroy();
        this._indicator = null;
        this._settings = null;
    }
    
    /**
     * Parse a date string in the format YYYY-MM-DD.
     * Returns a Date object.
     */
    _parseTargetDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        // Month is 0-indexed in JavaScript Date.
        return new Date(year, month - 1, day);
    }
    
    /**
     * Calculates seconds to midnight - when the UI should be refreshed
     * and deploys a timer to execute a refresh at midnight.
     */
    _setupMidnightRefresh(targetDate) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
    
        const secondsUntilMidnight = Math.ceil((tomorrow - now) / 1000);
    
        // Set up one-time timeout for midnight.
        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, secondsUntilMidnight, () => {
            // Refresh display at midnight.
            this._refresh(targetDate);
            // Set up next midnight refresh.
            this._setupMidnightRefresh(targetDate);
            // Don't repeat this specific timeout.
            return false;     
        });
    } 
    
    /**
     * Update the display.
     */
    _refresh(targetDate) {
        const now = new Date();
        
        // Calculate the difference in milliseconds.
        const diffMilliseconds = targetDate.getTime() - now.getTime();
        
        // Convert to days and round to remove partial days.
        const diffDays = Math.ceil(diffMilliseconds / (1000 * 60 * 60 * 24));
        
        const icon = this._settings.get_string('icon');
        const displayText = `${icon}  |  ${diffDays}`;
        
        // Update the label if not hidden.
        if (this._settings && !this._settings.get_boolean('hide')) {
            this._label.set_text(displayText);
        }
        
        return true;
    }
}
