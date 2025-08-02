const { combineRgb } = require('@companion-module/base');

module.exports = {
	getFeedbacks() {
		const feedbacks = {};
		
		feedbacks.crosspoint_status = {
			name: 'BUS/SOURCE Crosspoint Status',
			type: 'boolean',
			label: 'BUS/SOURCE Crosspoint Status',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0)
			},
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
			callback: (feedback) => {
				const busVar = this.getBusVariableFromID( feedback.options.bus );
				const busStatus = this.getVariableValue(busVar);
				return busStatus == feedback.options.src;
			}
		};
		
		feedbacks.connect_status = {
			name: 'Connection Status',
			type: 'boolean',
			label: 'Mixer connection status',
			defaultStyle: {
				color: combineRgb(255, 255, 255)
			},
			options: [],
			callback: (_feedback) => {
				return this.getVariableValue('connect_status') == 'ok';
			}
		};
		
		return feedbacks;
	}
};
