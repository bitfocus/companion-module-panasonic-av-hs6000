const { Regex } = require('@companion-module/base');
module.exports = {
	getConfigFields() {
		return [
			{
				id: 'info',
				type: 'static-text',
				width: 12,
				label: 'Information',
				value: "This module allow to controls a Panasonic AV-HS6000 video mixer buses crosspoints.<br/>It's based on this native <a target='_blank' href='https://eww.pass.panasonic.co.jp/pro-av/support/dload/hs6000_3ext/AV-HS6000%20external%20IF_protocol-E.pdf'>protocol</a><br/>",
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Mixer IP',
				width: 8,
				regex: Regex.IP,
				default: '192.168.0.10'
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Mixer Port',
				width: 4,
				regex: Regex.PORT,
				min: 1,
				max: 65535,
				default: '62000'
			},
			{
				id: 'info',
				type: 'static-text',
				width: 12,
				label: 'Refresh crosspoints',
				value: "As this protocol does not allow you to be notified when a crosspoint is modified, to keep the crosspoint status up to date, you need to query the mixer regularly.<br/>Moreover, this protocol requires you to send at least one command every 20s, otherwise you'll be automatically disconnected. This crosspoint refresh keeps the connection open at all times."
			},
			{
				type: 'number',
				id: 'refreshTiming',
				label: 'Refresh timing (in seconds)',
				width: 4,
				regex: Regex.PORT,
				min: 0,
				max: 30,
				default: 1
			},
			{
				id: 'info',
				type: 'static-text',
				width: 12,
				label: 'Enables BUSES',
				value: "Select below buses you want to control."
			},
			{
				type: 'checkbox',
				id: 'enableME1',
				label: 'ME1',
				width: 2,
				default: true
			},
			{
				type: 'checkbox',
				id: 'enableME2',
				label: 'ME2',
				width: 2,
				default: true
			},
			{
				type: 'checkbox',
				id: 'enableAUX',
				label: 'AUX',
				width: 2,
				default: true
			},
			{
				type: 'checkbox',
				id: 'enableDSK',
				label: 'DSK',
				width: 2,
				default: false
			},
			{
				type: 'checkbox',
				id: 'enableUSK',
				label: 'USK',
				width: 4,
				default: false
			},
			{
				type: 'checkbox',
				id: 'enableMV1',
				label: 'MV1',
				width: 2,
				default: false
			},
			{
				type: 'checkbox',
				id: 'enableMV2',
				label: 'MV2',
				width: 2,
				default: false
			},
			{
				type: 'checkbox',
				id: 'enableMV3',
				label: 'MV3',
				width: 2,
				default: false
			},
			{
				type: 'checkbox',
				id: 'enableMV4',
				label: 'MV4',
				width: 6,
				default: false
			},
			{
				id: 'src_name',
				type: 'dropdown',
				label: 'Sources Name',
				width: 6,
				default: 'default',
				choices: [
					{ id: 'default'	, label: 'Default' },
					{ id: 'panel'	, label: 'Mixer Panel' },
					{ id: 'mv'	, label: 'Mixer MV' }
				],
			},
			{
				type: 'number',
				id: 'srcNameRefreshTiming',
				label: 'Sources Name Refresh timing (in seconds)',
				width: 6,
				regex: Regex.PORT,
				min: 10,
				max: 120,
				default: 30,
				isVisible: (configValues) => (configValues.src_name === 'panel' || configValues.src_name === 'mv')
			},
			{
				type: 'number',
				id: 'timeout',
				label: 'Send Command Timeout (in ms)',
				width: 12,
				regex: Regex.PORT,
				min: 5,
				max: 500,
				default: 100
			}
		];
	}
};