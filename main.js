const { InstanceBase, runEntrypoint, InstanceStatus, TCPHelper } = require('@companion-module/base');
const configFields = require('./configFields');
const actions = require('./actions');
const feedbacks = require('./feedbacks');
const presets = require('./presets');
const variables = require('./variables');

let refreshBusTimer;
let refreshSrcTimer;

let tcpCommandBuffer = [];
let tcpSendTimeout;
let currentCmd = false;

const autoReply = false;

const BUS = [
	{ id: '01'	, label: 'ME1 PGM' }, // 0
	{ id: '02'	, label: 'ME1 PRW' },
	{ id: '03'	, label: 'ME1 KEY1-F' },
	{ id: '04'	, label: 'ME1 KEY1-S' },
	{ id: '05'	, label: 'ME1 KEY2-F' },
	{ id: '06'	, label: 'ME1 KEY2-S' },
	{ id: '07'	, label: 'ME1 KEY3-F' },
	{ id: '08'	, label: 'ME1 KEY3-S' },
	{ id: '09'	, label: 'ME1 KEY4-F' },
	{ id: '10'	, label: 'ME1 KEY4-S' },
	{ id: '11'	, label: 'ME1 UTIL1' },
	{ id: '12'	, label: 'ME1 UTIL2' }, // 11
	
	{ id: '13'	, label: 'ME2 PGM' }, // 12
	{ id: '14'	, label: 'ME2 PRW' },
	{ id: '15'	, label: 'ME2 KEY1-F' },
	{ id: '16'	, label: 'ME2 KEY1-S' },
	{ id: '17'	, label: 'ME2 KEY2-F' },
	{ id: '18'	, label: 'ME2 KEY2-S' },
	{ id: '19'	, label: 'ME2 KEY3-F' },
	{ id: '20'	, label: 'ME2 KEY3-S' },
	{ id: '21'	, label: 'ME2 KEY4-F' },
	{ id: '22'	, label: 'ME2 KEY4-S' },
	{ id: '23'	, label: 'ME2 UTIL1' },
	{ id: '24'	, label: 'ME2 UTIL2' }, // 23
	
	{ id: '97'	, label: 'DSK 1-F' }, // 24
	{ id: '98'	, label: 'DSK 1-S' },
	{ id: '99'	, label: 'DSK 2-F' },
	{ id: '100'	, label: 'DSK 2-S' },
	{ id: '101'	, label: 'DSK 3-F' },
	{ id: '102'	, label: 'DSK 3-S' },
	{ id: '103'	, label: 'DSK 4-F' },
	{ id: '104'	, label: 'DSK 4-S' }, // 31
	
	{ id: '113'	, label: 'AUX 01' }, // 32
	{ id: '114'	, label: 'AUX 02' },
	{ id: '115'	, label: 'AUX 03' },
	{ id: '116'	, label: 'AUX 04' },
	{ id: '117'	, label: 'AUX 05' },
	{ id: '118'	, label: 'AUX 06' },
	{ id: '119'	, label: 'AUX 07' },
	{ id: '120'	, label: 'AUX 08' },
	{ id: '121'	, label: 'AUX 09' },
	{ id: '122'	, label: 'AUX 10' },
	{ id: '123'	, label: 'AUX 11' },
	{ id: '124'	, label: 'AUX 12' },
	{ id: '125'	, label: 'AUX 13' },
	{ id: '126'	, label: 'AUX 14' },
	{ id: '127'	, label: 'AUX 15' },
	{ id: '128'	, label: 'AUX 16' }, // 47
	
	{ id: '141'	, label: 'DISP' }, // 48
	{ id: '142'	, label: 'USK 1-F' },
	{ id: '143'	, label: 'USK 1-S' },
	{ id: '144'	, label: 'USK 2-F' },
	{ id: '145'	, label: 'USK 2-S' },
	{ id: '146'	, label: 'USK 3-F' },
	{ id: '147'	, label: 'USK 3-S' },
	{ id: '148'	, label: 'USK 4-F' },
	{ id: '149'	, label: 'USK 4-S' },
	{ id: '150'	, label: 'VMEM-V' },
	{ id: '151'	, label: 'VMEM-K' }, // 58
	
	{ id: '153'	, label: 'MV1-1' }, // 59
	{ id: '154'	, label: 'MV1-2' },
	{ id: '155'	, label: 'MV1-3' },
	{ id: '156'	, label: 'MV1-4' },
	{ id: '157'	, label: 'MV1-5' },
	{ id: '158'	, label: 'MV1-6' },
	{ id: '159'	, label: 'MV1-7' },
	{ id: '160'	, label: 'MV1-8' },
	{ id: '161'	, label: 'MV1-9' },
	{ id: '162'	, label: 'MV1-10' },
	{ id: '163'	, label: 'MV1-11' },
	{ id: '164'	, label: 'MV1-12' },
	{ id: '165'	, label: 'MV1-13' },
	{ id: '166'	, label: 'MV1-14' },
	{ id: '167'	, label: 'MV1-15' },
	{ id: '168'	, label: 'MV1-16' }, // 74
	
	{ id: '169'	, label: 'MV2-1' }, // 75
	{ id: '170'	, label: 'MV2-2' },
	{ id: '171'	, label: 'MV2-3' },
	{ id: '172'	, label: 'MV2-4' },
	{ id: '173'	, label: 'MV2-5' },
	{ id: '174'	, label: 'MV2-6' },
	{ id: '175'	, label: 'MV2-7' },
	{ id: '176'	, label: 'MV2-8' },
	{ id: '177'	, label: 'MV2-9' },
	{ id: '178'	, label: 'MV2-10' },
	{ id: '179'	, label: 'MV2-11' },
	{ id: '180'	, label: 'MV2-12' },
	{ id: '181'	, label: 'MV2-13' },
	{ id: '182'	, label: 'MV2-14' },
	{ id: '183'	, label: 'MV2-15' },
	{ id: '184'	, label: 'MV2-16' }, // 90
	
	{ id: '185'	, label: 'MV3-1' }, // 91
	{ id: '186'	, label: 'MV3-2' },
	{ id: '187'	, label: 'MV3-3' },
	{ id: '188'	, label: 'MV3-4' },
	{ id: '189'	, label: 'MV3-5' },
	{ id: '190'	, label: 'MV3-6' },
	{ id: '191'	, label: 'MV3-7' },
	{ id: '192'	, label: 'MV3-8' },
	{ id: '193'	, label: 'MV3-9' },
	{ id: '194'	, label: 'MV3-10' },
	{ id: '195'	, label: 'MV3-11' },
	{ id: '196'	, label: 'MV3-12' },
	{ id: '197'	, label: 'MV3-13' },
	{ id: '198'	, label: 'MV3-14' },
	{ id: '199'	, label: 'MV3-15' },
	{ id: '200'	, label: 'MV3-16' }, // 106
	
	{ id: '201'	, label: 'MV4-1' }, // 107
	{ id: '202'	, label: 'MV4-2' },
	{ id: '203'	, label: 'MV4-3' },
	{ id: '204'	, label: 'MV4-4' },
	{ id: '205'	, label: 'MV4-5' },
	{ id: '206'	, label: 'MV4-6' },
	{ id: '207'	, label: 'MV4-7' },
	{ id: '208'	, label: 'MV4-8' },
	{ id: '209'	, label: 'MV4-9' },
	{ id: '210'	, label: 'MV4-10' },
	{ id: '211'	, label: 'MV4-11' },
	{ id: '212'	, label: 'MV4-12' },
	{ id: '213'	, label: 'MV4-13' },
	{ id: '214'	, label: 'MV4-14' },
	{ id: '215'	, label: 'MV4-15' },
	{ id: '216'	, label: 'MV4-16' } // 122
];

const SOURCES = [
	{ id: '01'	, label: 'SDI 01' },
	{ id: '02'	, label: 'SDI 02' },
	{ id: '03'	, label: 'SDI 03' },
	{ id: '04'	, label: 'SDI 04' },
	{ id: '05'	, label: 'SDI 05' },
	{ id: '06'	, label: 'SDI 06' },
	{ id: '07'	, label: 'SDI 07' },
	{ id: '08'	, label: 'SDI 08' },
	{ id: '09'	, label: 'SDI 09' },
	{ id: '10'	, label: 'SDI 10' },
	{ id: '11'	, label: 'SDI 11' },
	{ id: '12'	, label: 'SDI 12' },
	{ id: '13'	, label: 'SDI 13' },
	{ id: '14'	, label: 'SDI 14' },
	{ id: '15'	, label: 'SDI 15' },
	{ id: '16'	, label: 'SDI 16' },
	{ id: '17'	, label: 'SDI 17' },
	{ id: '18'	, label: 'SDI 18' },
	{ id: '19'	, label: 'SDI 19' },
	{ id: '20'	, label: 'SDI 20' },
	{ id: '21'	, label: 'SDI 21' },
	{ id: '22'	, label: 'SDI 22' },
	{ id: '23'	, label: 'SDI 23' },
	{ id: '24'	, label: 'SDI 24' },
	{ id: '25'	, label: 'SDI 25' },
	{ id: '26'	, label: 'SDI 26' },
	{ id: '27'	, label: 'SDI 27' },
	{ id: '28'	, label: 'SDI 28' },
	{ id: '29'	, label: 'SDI 29' },
	{ id: '30'	, label: 'SDI 30' },
	{ id: '31'	, label: 'SDI 31' },
	{ id: '32'	, label: 'SDI 32' },
	
	{ id: '73'	, label: 'DVI 1' },
	{ id: '74'	, label: 'DVI 2' },
	
	{ id: '145'	, label: 'CBGD 1' },
	{ id: '146'	, label: 'CBGD 2' },
	{ id: '147'	, label: 'CBAR' },
	
	{ id: '148'	, label: 'BLACK' },
	
	{ id: '149'	, label: 'STILL 1-V' },
	{ id: '150'	, label: 'STILL 1-K' },
	{ id: '151'	, label: 'STILL 2-V' },
	{ id: '152'	, label: 'STILL 2-K' },
	{ id: '153'	, label: 'STILL 3-V' },
	{ id: '154'	, label: 'STILL 3-K' },
	{ id: '155'	, label: 'STILL 4-V' },
	{ id: '156'	, label: 'STILL 4-K' },
	
	{ id: '157'	, label: 'CLIP 1-V' },
	{ id: '158'	, label: 'CLIP 1-K' },
	{ id: '159'	, label: 'CLIP 2-V' },
	{ id: '160'	, label: 'CLIP 2-K' },
	{ id: '161'	, label: 'CLIP 3-V' },
	{ id: '162'	, label: 'CLIP 3-K' },
	{ id: '163'	, label: 'CLIP 4-V' },
	{ id: '164'	, label: 'CLIP 4-K' },
	
	{ id: '165'	, label: 'MV1' },
	{ id: '166'	, label: 'MV2' },
	{ id: '167'	, label: 'MV3' },
	{ id: '168'	, label: 'MV4' },
	
	{ id: '169'	, label: 'ME1 PGM' },
	{ id: '170'	, label: 'ME1 PVW' },
	{ id: '171'	, label: 'ME1 CLN' },
	{ id: '172'	, label: 'ME1 KEY PVW' },
	
	{ id: '173'	, label: 'ME2 PGM' },
	{ id: '174'	, label: 'ME2 PVW' },
	{ id: '175'	, label: 'ME2 CLN' },
	{ id: '176'	, label: 'ME2 KEY PVW' },
	
	{ id: '201'	, label: 'DSK PGM 1' },
	{ id: '202'	, label: 'DSK PGM 2' },
	{ id: '203'	, label: 'DSK PVW 1' },
	{ id: '204'	, label: 'DSK PVW 2' },
	
	{ id: '209'	, label: 'DSK1 CLN' },
	{ id: '210'	, label: 'DSK2 CLN' },
	{ id: '211'	, label: 'DSK3 CLN' },
	{ id: '212'	, label: 'DSK4 CLN' },
	
	{ id: '225'	, label: 'SEL-KEYPVW' },
	
	{ id: '227'	, label: 'AUX 01' },
	{ id: '228'	, label: 'AUX 02' },
	{ id: '229'	, label: 'AUX 03' },
	{ id: '230'	, label: 'AUX 04' },
	{ id: '231'	, label: 'AUX 05' },
	{ id: '232'	, label: 'AUX 06' },
	{ id: '233'	, label: 'AUX 07' },
	{ id: '234'	, label: 'AUX 08' },
	{ id: '235'	, label: 'AUX 09' },
	{ id: '236'	, label: 'AUX 10' },
	{ id: '237'	, label: 'AUX 11' },
	{ id: '238'	, label: 'AUX 12' },
	{ id: '239'	, label: 'AUX 13' },
	{ id: '240'	, label: 'AUX 14' },
	{ id: '241'	, label: 'AUX 15' },
	{ id: '242'	, label: 'AUX 16' },
	
	{ id: '251'	, label: 'CLOCK' },
	{ id: '252'	, label: 'LTC' }
];

class AVHSInstance extends InstanceBase {
	constructor(internal) {
		super(internal);
		Object.assign(this, {
			...configFields,
			...actions,
			...feedbacks,
			...presets,
			...variables
		});
	}

	async init(config) {
		this.config = config;
		
		this.updateActionsDefinitions();
		this.updateFeedbacksDefinitions();
		this.updateVariableDefinitions();
		this.updatePresetsDefinitions();
		
		// INIT CONNECTION
		this.initTCP();
	}

	// When module gets deleted
	async destroy() { this.killTCP(); }

	async configUpdated(config) {
		this.killTCP();
		this.config = config;
		
		if(this.config.refreshTiming>0===false) this.config.refreshTiming = 0;
		else if(this.config.refreshTiming>30) this.config.refreshTiming = 30;
		
		if(this.config.srcNameRefreshTiming>10===false) this.config.srcNameRefreshTiming = 10;
		else if(this.config.srcNameRefreshTiming>120) this.config.srcNameRefreshTiming = 120;
		
		if(this.config.timeout>5===false) this.config.timeout = 5;
		else if(this.config.timeout>500) this.config.timeout = 500;
		
		this.updateActionsDefinitions();
		this.updateFeedbacksDefinitions();
		this.updateVariableDefinitions();
		this.updatePresetsDefinitions();
		
		this.initTCP();
	}
	
	updateActionsDefinitions() { this.setActionDefinitions( this.getActions() ); }
	updateFeedbacksDefinitions() { this.setFeedbackDefinitions( this.getFeedbacks() ); }
	updateVariableDefinitions() { this.setVariableDefinitions( this.getVariables() ); this.initVariablesValues(); }
	updatePresetsDefinitions() { this.setPresetDefinitions( this.getPresets() ); }
	
	// BUS LIST
	getBusList() {
		let busList = [];
		if(this.config.enableME1) busList = busList.concat( BUS.slice(0,12) );
		if(this.config.enableME2) busList = busList.concat( BUS.slice(12,24) );
		if(this.config.enableDSK) busList = busList.concat( BUS.slice(24,32) );
		if(this.config.enableAUX) busList = busList.concat( BUS.slice(32,48) );
		if(this.config.enableUSK) busList = busList.concat( BUS.slice(48,59) );
		if(this.config.enableMV1) busList = busList.concat( BUS.slice(59,75) );
		if(this.config.enableMV2) busList = busList.concat( BUS.slice(75,91) );
		if(this.config.enableMV3) busList = busList.concat( BUS.slice(91,107) );
		if(this.config.enableMV4) busList = busList.concat( BUS.slice(107) );
		return busList;
	}
	getBusNameByID(id) {
		let name = "";
		const l = BUS.length;
		for(let i=0; i<l; i++) {
			if(BUS[i].id == id) {
				name = BUS[i].label;
				break;
			}
		}
		return name;
	}
	getBusNumByID(id) {
		const busList = this.getBusList();
		let num = -1;
		const l = busList.length;
		for(let i=0; i<l; i++) {
			if(busList[i].id == id) {
				num = i;
				break;
			}
		}
		return num;
	}
	getBusVariableFromName(name) { return "bus_"+name.replaceAll(" ", "-"); }
	getBusVariableFromID(id) { const name = this.getBusNameByID(id); return (name!="") ? this.getBusVariableFromName(name) : ""; }
	getFirstBusID() {
		const busList = this.getBusList();
		if(busList.length>0) return busList[0].id;
		return "00";
	}
	
	// SOURCES
	getSourcesList() { return SOURCES; }
	getSourceNameByID(id, forceDefault) {
		let name = "";
		const l = SOURCES.length;
		for(let i=0; i<l; i++) {
			if(SOURCES[i].id == id) {
				const label = SOURCES[i].label;
				name = (this.config.src_name=="panel" || this.config.src_name=="mv") && !forceDefault ? this.getVariableValue(this.getSourceVariableFromName(label)) : label;
				break;
			}
		}
		return name;
	}
	getSourceNumByID(id) {
		let num = -1;
		const l = SOURCES.length;
		for(let i=0; i<l; i++) {
			if(SOURCES[i].id == id) {
				num = i;
				break;
			}
		}
		return num;
	}
	getSourceVariableFromName(name) { return "src_"+name.replaceAll(" ", "-"); }
	getSourceVariableFromID(id) { const name = this.getSourceNameByID(id, true); return (name!="") ? this.getSourceVariableFromName(name) : ""; }
	
	// TCP CONNECTION
	initTCP() {
		this.killTCP();
		
		this.log('info', `AV-HS6000 | INIT TCP CONNECTION >>> ${this.config.host} ${this.config.port}`);
		
		if(this.config.host && this.config.port) {
			this.log('info', `AV-HS6000 | Opening TCP connection to ${this.config.host}:${this.config.port}`);
			this.socket = new TCPHelper(this.config.host, this.config.port, { reconnect: true });

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message);
				this.setVariableValues({connect_status: status});
				this.checkFeedbacks('connect_status');
				
				this.log('info', `AV-HS6000 | TCP connection status changed >>> ${status}`);
				if(status=="ok") {
					this.refreshBusesXPT();
					this.refreshSourcesNames();
				}
				else {
					this.stopRefreshBusesXPTtimer();
					this.stopRefreshSourcesNamesTimer();
					this.clearTcpCommandBuffer();
				}
			});

			this.socket.on('error', (err) => {
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message);
				this.log('error', 'TCP CONTROL | Network error: ' + err.message);
			});

			this.socket.on('data', (data) => { 
				this.parseReceivedMessage(data.toString());
			});
		}
	}
	
	killTCP() {
		this.stopRefreshBusesXPTtimer();
		this.stopRefreshSourcesNamesTimer();
		this.clearTcpCommandBuffer();
		if(this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}
		this.setVariableValues({connect_status: 'disconnected'});
		this.checkFeedbacks('connect_status');
	}
	
	// SEND COMMAND
	sendCommand(cmd, clbk) {
		if(cmd!='') {
			tcpCommandBuffer.push({cmd: cmd, clbk: clbk});
			this.sendNextCommand();
		}
	}
	sendPriorityCommand(cmd, clbk) {
		if(cmd!='') {
			tcpCommandBuffer.unshift({cmd: cmd, clbk: clbk});
			this.sendNextCommand();
		}
	}
	
	async sendNextCommand() {
		if(tcpSendTimeout || tcpCommandBuffer.length==0) return;
		tcpSendTimeout = true;
		const cue = tcpCommandBuffer.shift();
		let cmd = cue.cmd;
		const escCmd = unescape(await this.parseVariablesInString(cmd));
		if(escCmd!="") {
			this.log('debug', `AV-HS6000 | SENDIND COMMAND >>> ${escCmd} | callback: ${cue.clbk}`);
			const sendBuf = Buffer.from(escCmd, 'latin1');
			if(this.socket !== undefined && this.socket.isConnected) {
				currentCmd = cue;
				this.socket.send(sendBuf);
				tcpSendTimeout = setTimeout(function(self) { self.onSendCommandTimeout(); }, this.config.timeout, this);

				/*** AUTO REPLY ***/
				if(autoReply) {
					cmd = cmd.replaceAll("%02", "").replaceAll("%03", "");
					const parts = cmd.split(":");
					// GET BUS XPT
					if(parts[0] == "QBSC" && parts.length==2) {
						setTimeout(function(self) {
							const busStatus = self.getVariableValue(self.getBusVariableFromID(parts[1]));
							const source = (busStatus && busStatus!='00') ? busStatus : '01';
							self.parseReceivedMessage(` ABSC:${parts[1]}:${source} `);
						}, 2, this);
					}
					// SET BUS XPT
					else if(parts[0] == "SBUS" && parts.length==3) {
						setTimeout(function(self) {
							self.parseReceivedMessage(` ABUS:${parts[1]}:${parts[2]} `);
						}, 2, this);
					}
					// SRC NAME
					else if(parts[0] == "QSNM" && parts.length==3) {
						setTimeout(function(self) {
							const srcName = self.getVariableValue(self.getSourceVariableFromID(parts[2]));
							self.parseReceivedMessage(` ASNM:${parts[1]}:${parts[2]}:${srcName || 'Unknown'} `);
						}, 2, this);
					}
				}
			}
			else this.log('warn', `AV-HS6000 | CANNOT SEND COMMAND - Socket not connected >>> ${cmd}`);
		}
		else if(tcpCommandBuffer.length>0) this.sendNextCommand();
	}
	
	onSendCommandTimeout() {
		this.log('warn', `AV-HS6000 | SEND COMMAND TIMEOUT >>> ${currentCmd.cmd}`);
		tcpSendTimeout=undefined;
		
		// CALLBACK
		if(currentCmd.clbk=="startRefreshBusesXPTtimer") this.startRefreshBusesXPTtimer();
		else if(currentCmd.clbk=="startRefreshSourcesNamesTimer") this.startRefreshSourcesNamesTimer();
		
		currentCmd = false;
		this.sendNextCommand();
	}
	
	clearTcpCommandBuffer() {
		if(tcpSendTimeout) { clearTimeout(tcpSendTimeout); tcpSendTimeout=undefined; }
		tcpCommandBuffer = [];
		currentCmd = false;
	}
	
	// PARSE RECEIVED MESSAGE
	parseReceivedMessage(msg) {
		if(tcpSendTimeout) { clearTimeout(tcpSendTimeout); tcpSendTimeout=undefined; }
		
		this.log('debug', `AV-HS6000 | receive message > "${msg}"`);
		msg = msg.slice(1, -1);
		const method = msg.slice(0,4);
		// BUS XPT
		if(method=="ABUS" || method=="ABSC") {
			const parts = msg.split(":");
			if(parts.length==3) {
				const busVar = this.getBusVariableFromID( parts[1] );
				if(busVar!="") {
					const variables = {};
					variables[busVar] = parts[2];
					this.setVariableValues(variables);
					this.checkFeedbacks('crosspoint_status');
				}
			}
		}
		// SRC NAME
		else if(method=="ASNM") {
			const parts = msg.split(":");
			if(parts.length==4) {
				const srcVar = this.getSourceVariableFromID( parts[2] );
				const srcName = parts[3].replaceAll(' ', '\n');
				if(srcVar!="") {					
					const variables = {};
					variables[srcVar] = srcName;
					this.setVariableValues(variables);
				}
			}
		}
		
		// CALLBACK
		if(currentCmd.clbk=="startRefreshBusesXPTtimer") this.startRefreshBusesXPTtimer();
		else if(currentCmd.clbk=="startRefreshSourcesNamesTimer") this.startRefreshSourcesNamesTimer();
		currentCmd = false;
		
		this.sendNextCommand();
	}
	
	// REFRESH BUS XPT
	refreshBusesXPT() {
		const busList = this.getBusList();
		const l = busList.length;
		for(let i=0; i<l; i++) {
			const busID = busList[i].id;
			const cmd = `%02QBSC:${busID}%03`;
			this.sendCommand(cmd, (i==l-1) ? "startRefreshBusesXPTtimer" : false);
		}
	}
	startRefreshBusesXPTtimer() { 
		if(this.config.refreshTiming>0) refreshBusTimer = setTimeout(
			function(self) { self.refreshBusesXPT(); }, 
			this.config.refreshTiming*1000, 
			this
		);
	}
	stopRefreshBusesXPTtimer() {
		if(refreshBusTimer) {
			clearTimeout( refreshBusTimer );
			refreshBusTimer = undefined;
		}
	}
	
	// REFRESH SRC NAME
	refreshSourcesNames() {
		const srcList = this.getSourcesList();
		const l = srcList.length;
		if(l>0 && (this.config.src_name=="panel" || this.config.src_name=="mv")) {
			const from = this.config.src_name=="panel" ? '00' : '01';
			for(let i=0; i<l; i++) {
				const srcID = srcList[i].id;
				const cmd = `%02QSNM:${from}:${srcID}%03`;
				this.sendCommand(cmd, (i==l-1) ? "startRefreshSourcesNamesTimer" : false);
			}
		}
	}
	startRefreshSourcesNamesTimer() { 
		if(this.config.srcNameRefreshTiming>0) refreshSrcTimer = setTimeout(
			function(self) { self.refreshSourcesNames(); }, 
			this.config.srcNameRefreshTiming*1000, 
			this
		);
	}
	stopRefreshSourcesNamesTimer() {
		if(refreshSrcTimer) {
			clearTimeout( refreshSrcTimer );
			refreshSrcTimer = undefined;
		}
	}
}

runEntrypoint(AVHSInstance, []);
