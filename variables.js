module.exports = {
	getVariables() {
		const variables = [];
		
		// CONNECTED
		variables.push({ variableId: 'connect_status', name: 'Connection Status' });
		
		// BUS
		const busList = this.getBusList();
		busList.forEach((b) => {
			let id = this.getBusVariableFromName( b.label );
			variables.push({ variableId: id, name: b.label });
		});
		// SOURCES
		const sourcesList = this.getSourcesList();
		sourcesList.forEach((s) => {
			let id = this.getSourceVariableFromName( s.label );
			variables.push({ variableId: id, name: s.label });
		});
		return variables;
	},
	initVariablesValues() {
		const variables = {};
		
		// BUS
		var busList = this.getBusList();
		busList.forEach((b) => {
			let id = this.getBusVariableFromName( b.label );
			variables[id] = '00';
		});
		// SOURCES
		const sourcesList = this.getSourcesList();
		sourcesList.forEach((s) => {
			let id = this.getSourceVariableFromName( s.label );
			variables[id] = s.label.replaceAll(' ', '\n');
		});
		this.setVariableValues(variables);
	}
};
