const { combineRgb } = require('@companion-module/base');
module.exports = {
	getPresets() {
		const presets = {};
		
		const busList = this.getBusList();
		const srcList = this.getSourcesList();
		busList.forEach((bus) => {
			srcList.forEach((src) => {
				const srcVar = this.getSourceVariableFromName(src.label);
				presets[`xpt_${bus.id}_${src.id}`] = {
					type: 'button',
					category: bus.label+" - XPT",
					style: {
						text: `$(AV-HS6000:${srcVar})`,
						//size: '16',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0)
					},
					steps: [{
						down: [{
							actionId: 'setCrosspoint',
							options: { bus: bus.id, src: src.id }
						}]
					}],
					feedbacks: [
						{
							feedbackId: 'crosspoint_status',
							options: { bus: bus.id, src: src.id },
							style: { bgcolor: combineRgb(255, 0, 0) }
						},
						{
							feedbackId: 'connect_status',
							options: {},
							isInverted: true,
							style: { color: combineRgb(255, 80, 80), bgcolor: combineRgb(80, 0, 0) }
						}
					]
				};
			});
		});

		return presets;
	}
};