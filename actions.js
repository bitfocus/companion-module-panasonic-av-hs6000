const { Regex } = require('@companion-module/base');

module.exports = {
	getActions() {
		const actions = {};
		
		actions.setCrosspoint = {
			name: 'Set crosspoint',
			options: [
				{
					id: 'bus',
					type: 'dropdown',
					label: 'BUS',
					choices: this.getBusList(),
					default: this.getFirstBusID()
				},
				{
					id: 'src',
					type: 'dropdown',
					label: 'SOURCE',
					choices: this.getSourcesList(),
					default: '01'
				}
			],
			callback: async (event) => {
				this.log('info', `AV-HS6000 | SET CROSSPOINT >>> ${this.getBusNameByID(event.options.bus)} > ${this.getSourceNameByID(event.options.src, false)}`);
				this.sendPriorityCommand('%02SBUS:' + event.options.bus + ":" + event.options.src + "%03");
			}
		};
		
		actions.sendCommand = {
			name: 'Send Command',
			options: [
				{
					type: 'textinput',
					id: 'cmd',
					label: 'Command:',
					tooltip: 'Use %hh to insert Hex codes\nObsolete, use Send HEX command instead',
					default: '',
					useVariables: true,
				}
			],
			callback: async (event) => {
				this.log('info', `AV-HS6000 | SEND COMMAND >>> ${event.options.cmd}`);
				await this.sendPriorityCommand(event.options.cmd, false);
			}
		};

		return actions;
	}
};