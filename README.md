### Time is of the essence.
This is a general purpose timer that counts down instead of up. (days)

Put an emoji in the ```./schemas/org.gnome.shell.extensions.gnomecountdowntimerextension.gschema.xml``` file and a target date.

Then connect with your mortality, human.

![Screenshot from 2025-04-29 18-23-31](https://github.com/user-attachments/assets/e86525c5-a5d0-45a8-a8e5-aa77d47220e6)
![Screenshot from 2025-04-29 18-24-00](https://github.com/user-attachments/assets/4124dec8-e1e5-4fd0-932d-acefc4a55d00)

If you want know more about building these, see this site - https://gjs.guide/extensions/#gnome-shell-extensions

---

### Installing
 
```bash
make install
```

Reload GNOME. It will then register in your list of extensions. (Log off...)

```bash
gnome-extensions enable gnomebtcextension@daniel.gomes.digital
```
<br/><br/>
There is an ```uninstall``` block in the Makefile as well.

