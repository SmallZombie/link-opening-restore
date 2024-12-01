import { Plugin } from 'obsidian';


interface LinkOpeningRestorePluginSettings {
	isEnabled: boolean;
}

const DEFAULT_SETTINGS: LinkOpeningRestorePluginSettings = {
	isEnabled: true
}


export default class LinkOpeningRestore extends Plugin {
	settings: LinkOpeningRestorePluginSettings;


	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'toggle-feature',
			name: '切换功能开关',
			callback: () => {
				this.settings.isEnabled = !this.settings.isEnabled;
				this.saveSettings();

				// 仅编辑模式
				const editors = document.querySelectorAll('.cm-editor');
				editors.forEach(v => {
					v.removeEventListener('click', this.handleClick);
					if (this.settings.isEnabled) {
						v.addEventListener('click', this.handleClick);
					}
				});
			}
		});

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', () => {
				if (!this.settings.isEnabled) return;

				const editors = document.querySelectorAll('.cm-editor');
				editors.forEach(v => {
					v.removeEventListener('click', this.handleClick);
					v.addEventListener('click', this.handleClick);
				});
			})
		);
	}

	onunload() {
		const editors = document.querySelectorAll('.cm-editor');
		editors.forEach(editor => {
			editor.removeEventListener('click', this.handleClick);
		});
	}


	private handleClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.tagName === 'A' && !event.ctrlKey) {
			event.stopPropagation();
		}
	};

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
