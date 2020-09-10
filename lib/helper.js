"use strict";

class fHelpers{

    //#region Constructor
	/**
	 * @param Fahrplan this-Object from Base-Class
	 */
    constructor(Fahrplan){
        this.Fahrplan = Fahrplan;
        this.hClient = null;
    }
    //#endregion

	//#region Helper Function ErrorCustom
	/**
	 * Helper function for StationSearch in Admin
	 * @param {String} Name Name for error
	 * @param {string} Message Error message
	 */
	ErrorCustom(Name, Message = ""){
        try{ 
			let Err = new Error();
			Err.name = Name;
			Err.message = Message;
			return Err;
        } catch (e){
            this.Fahrplan.log.error(`Exception in ErrorCustom [${e}]`);
        }
	} 
	//#endregion

	//#region Helper Function ErrorReporting
	/**
	 * Helper function for StationSearch in Admin
	 * @param {Error} Err Error-Object
	 * @param {string} FriendlyError Error message for user
	 * @param {string} NameClass Name of the class where error occured
	 * @param {string} NameFunction Name of the function where error occured
	 * @param {string} NameSubFunction Name of the subfunction where error occured
	 * @param {Object} Info Contextual information
	 */
	async ErrorReporting(Err, FriendlyError, NameClass, NameFunction, NameSubFunction = "", Info = []){
        try{ 
				let sErrMsg = `Error occured: ${FriendlyError} in ${NameClass}/${NameFunction}`;
				if (NameSubFunction !== "") sErrMsg = sErrMsg + `(${NameSubFunction})`;
				if (Err.name !== "HANDLED") sErrMsg = sErrMsg + ` [${Err}]`;
				this.Fahrplan.log.error(sErrMsg);
				//this.Fahrplan.log.error(Err.stack);
        } catch (e){
            this.Fahrplan.log.error(`Exception in ErrorReporting [${e}]`);
        }
	} 
	//#endregion

	//#region Helper Function getStation
	/**
	 * Helper function for StationSearch in Admin
	 * @param {string} sProvider Configured provider in Admin
	 * @param {string} sSearchString Searchstring entered in Admin
	 */
	async getStation(sProvider, sSearchString){
        try{ 
            this.Fahrplan.log.silly(`Search: Provider = ${sProvider} SearchString = ${sSearchString}`);
            const sResult = await this.hClient.locations(sSearchString, {results: 10});
            this.Fahrplan.log.silly(`STATION: ${JSON.stringify(sResult)}`);
            return sResult;
        } catch (e){
			this.ErrorReporting(e, `Exception receiving Stations`, "fHelpers", "createHTML", "", {provider: sProvider, searchstring: sSearchString});
			throw this.ErrorCustom("HANDLED");
        }   
	} 
	//#endregion

	//#region Helper Function SetTextState
	/**
	* Sets Text State
	* @param {string} sStateName Name of the State
	* @param {string} sDisplayName Displayed Name of the State
	* @param {string} sDescription Description of the State
	* @param {string} sValue Value of the State
	*/
	async SetTextState(sStateName, sDisplayName, sDescription, sValue, sRole = "state"){
		try{ 
			await this.Fahrplan.setObjectNotExistsAsync(sStateName, {
				type: "state",
				common: {
					name: sDisplayName,
					type: "string",
					role: sRole,
					read: true,
					write: false,
					desc: sDescription
				},
				native: {},
			});	
			await this.Fahrplan.setStateAsync(sStateName, { val: sValue, ack: true });
			return true;
		}catch(e){
			this.ErrorReporting(e, `Exception writing State`, "fHelpers", "SetTextState", "", {name: sStateName, displayname: sDisplayName, description: sDescription, value: sValue});
			throw `Exception in SetTextState [${e}]`;
		} 	
	} 
	//#endregion

	//#region Helper Function SetNumState
	/**
	* Sets Numeric State
	* @param {string} sStateName Name of the State
	* @param {string} sDisplayName Displayed Name of the State
	* @param {string} sDescription Description of the State
	* @param {number} sValue Value of the State
	*/
	async SetNumState(sStateName, sDisplayName, sDescription, sValue, sRole = "value"){
		try{ 
			await this.Fahrplan.setObjectNotExistsAsync(sStateName, {
				type: "state",
				common: {
					name: sDisplayName,
					type: "number",
					role: sRole,
					read: true,
					write: false,
					desc: sDescription
				},
				native: {},
			});	
			await this.Fahrplan.setStateAsync(sStateName, { val: sValue, ack: true });
			return true;
		}catch(e){
			this.ErrorReporting(e, `Exception writing State`, "fHelpers", "SetNumState", "", {name: sStateName, displayname: sDisplayName, description: sDescription, value: sValue, role: sRole});
			throw `Exception in SetNumState [${e}]`;
		} 	
	} 
	//#endregion

	//#region Helper Function SetBoolState
	/**
	* Sets boolean State
	* @param {string} sStateName Name of the State
	* @param {string} sDisplayName Displayed Name of the State
	* @param {string} sDescription Description of the State
	* @param {boolean} bValue Value of the State
	*/
	async SetBoolState(sStateName, sDisplayName, sDescription, bValue){
			try{ 
			await this.Fahrplan.setObjectNotExistsAsync(sStateName, {
				type: "state",
				common: {
					name: sDisplayName,
					type: "boolean",
					role: "state",
					read: true,
					write: false,
					desc: sDescription
				},
				native: {},
			});	
			await this.Fahrplan.setStateAsync(sStateName, { val: bValue, ack: true });
			return true;
		} catch (e){
			this.ErrorReporting(e, `Exception writing State`, "fHelpers", "SetBoolState", "", {name: sStateName, displayname: sDisplayName, description: sDescription, value: bValue});
			throw `Exception in SetBoolState [${e}]`;
		} 	
	}
	//#endregion

	//#region Helper Function SetChannel
	/**
	* Sets and creates channel object
	* @param {string} sStateName Name of the Channel
	* @param {string} sDisplayName Displayed Name of the Channel
	* @param {string} sDescription Description of the Channel
	*/
	async SetChannel(sStateName, sDisplayName, sDescription){
		try{ 
			await this.Fahrplan.setObjectNotExistsAsync(sStateName,{
				type: "channel",
				common:{
					name: sDisplayName,
					desc: sDescription
				},
				native:{} 
			});
			return true;
		} catch (e){
			this.ErrorReporting(e, `Exception writing State`, "fHelpers", "SetChannel", "", {name: sStateName, displayname: sDisplayName, description: sDescription});
			throw `Exception in SetChannel [${e}]`;
		} 
	}
	//#endregion

	//#region Helper Function deleteObject
	/**
	* Deletes object
	* @param {string} sStateName Name of the State
	*/
	async deleteObject(sStateName){
		try{ 
			let State = await this.Fahrplan.getStateAsync(sStateName);
			if (State !== null){
				this.Fahrplan.delObject(sStateName);
			} 
		}catch(e){
			this.ErrorReporting(e, `Exception removing State`, "fHelpers", "deleteObject", "", {name: sStateName});
			throw `Exception in DeleteObject [${e}]`;
		}
	} 
	//#endregion

	//#region Helper Function deleteConnections
	/**
	* Sets boolean State
	* @param {Number} iRoute Number of Route from configuration
	*/
	async deleteConnections(iRoute){
		try{ 
			let States = await this.Fahrplan.getStatesOfAsync(iRoute.toString());
			for (let State of States){
				if (State["_id"] !== `${this.Fahrplan.name}.${this.Fahrplan.instance}.${iRoute}.Enabled`) { 
					await this.Fahrplan.delObjectAsync(State["_id"]);
				}	
			} 
		}catch(e){
			this.ErrorReporting(e, `Exception removing Connection`, "fHelpers", "deleteConnections");
			throw `Exception in DeleteConnections [${e}]`;
		}
	} 
	//#endregion

	//#region Helper Function deleteConnections
	/**
	* Sets boolean State
	* @param {Number} iDepTT Number of Departure Timetable from configuration
	*/
	async deleteDepTT(iDepTT){
		try{ 
			let States = await this.Fahrplan.getStatesOfAsync(`DepartureTimetable${iDepTT.toString()}`);
			for (let State of States){
				if (State["_id"] !== `${this.Fahrplan.name}.${this.Fahrplan.instance}.DepartureTimetable${iDepTT}.Enabled`) { 
					await this.Fahrplan.delObjectAsync(State["_id"]);
				}
			} 
		}catch(e){
			this.ErrorReporting(e, `Exception removing Departure Timetable`, "fHelpers", "deleteDepTT");
			throw `Exception in DeleteDepTT [${e}]`;
		}
	} 
	//#endregion

	//#region Helper Function deleteUnusedSections
	/**
	* Sets boolean State
	* @param {Number} iRoute Number of Route from configuration
	* @param {Number} iConnection Number of Connection
	* @param {Number} iSections Number of Sections in Connection
	*/
	async deleteUnusedSections(iRoute, iConnection, iSections){
		try{ 
			let States = await this.Fahrplan.getObjectAsync(`${iRoute.toString()}.${iConnection.toString()}.*`);
			let SectionRegEx = `${this.Fahrplan.name}.${this.Fahrplan.instance}.${iRoute.toString()}.${iConnection.toString()}.(\\d*).*$`;
			this.Fahrplan.log.silly(`Delete Route #${iRoute} Connection #${iConnection} with max section # ${iSections} and regex:${SectionRegEx}`);	
			for (let State in States){
				let Searcher = State.toString().match(new RegExp(SectionRegEx));
				if (Searcher !== null){ 
					if (parseInt(Searcher[1]) > iSections ){
						await this.Fahrplan.delObjectAsync(State);
					}
				}	
			} 
			this.Fahrplan.getChannels((error, Channels) => {
				if (Channels && Channels !== null){ 
					for (let Channel of Channels){
						let Searcher = Channel["_id"].toString().match(new RegExp(SectionRegEx));
						if (Searcher !== null){ 
							if (parseInt(Searcher[1]) > iSections ){
								this.Fahrplan.delObject(Channel["_id"]);
							}
						}	
					}
				}	
			});
		}catch(e){
			this.ErrorReporting(e, `Exception removing unused Sections`, "fHelpers", "deleteUnusedSections");
			throw `Exception in DeleteUnusedSections [${e}]`;
		}
	} 
	//#endregion

	//#region Helper Function deleteUnusedConnections
	/**
	* Sets boolean State
	* @param {Number} iRoute Number of Route from configuration
	* @param {Number} iConnections Number of Connections in Route
	*/
	async deleteUnusedConnections(iRoute, iConnections){
		try{ 
			let States = await this.Fahrplan.getObjectAsync(`${iRoute.toString()}.*`);
			let SectionRegEx = `${this.Fahrplan.name}.${this.Fahrplan.instance}.${iRoute.toString()}.(\\d*).*$`;
			this.Fahrplan.log.silly(`Delete Route #${iRoute} with max Connection #${iConnections} and regex:${SectionRegEx}`);	
			for (let State in States){
				let Searcher = State.toString().match(new RegExp(SectionRegEx));
				if (Searcher !== null){ 
					if (parseInt(Searcher[1]) > iConnections ){
						//adapter.log.error(State);
						await this.Fahrplan.delObjectAsync(State);
					}
				}	
			}
			this.Fahrplan.getChannels((error, Channels) => {
				if (Channels && Channels !== null){ 
					for (let Channel of Channels){
						let Searcher = Channel["_id"].toString().match(new RegExp(SectionRegEx));
						if (Searcher !== null){ 
							if (parseInt(Searcher[1]) > iConnections ){
								this.Fahrplan.delObject(Channel["_id"]);
							}
						}	
					}
				}	
			});
		}catch(e){
			this.ErrorReporting(e, `Exception removing unused Connections`, "fHelpers", "deleteUnusedConnections");
			throw `Exception in DeleteUnusedConnections [${e}]`;
		}
	} 
	//#endregion

	//#region Helper Function deleteUnusedDepartures
	/**
	* Sets boolean State
	* @param {Number} iDepTT Number of Departure Timetable from configuration
	* @param {Number} iDepartures Number of Departures in Departure Timetable
	*/
	async deleteUnusedDepartures(iDepTT, iDepartures){
		try{ 
			let States = await this.Fahrplan.getObjectAsync(`DepartureTimetable${iDepTT.toString()}.*`);
			let SectionRegEx = `${this.Fahrplan.name}.${this.Fahrplan.instance}.DepartureTimetable${iDepTT.toString()}.(\\d*).*$`;
			this.Fahrplan.log.silly(`Delete Departure Timetable #${iDepTT} with max Departures #${iDepartures} and regex:${SectionRegEx}`);	
			for (let State in States){
				let Searcher = State.toString().match(new RegExp(SectionRegEx));
				if (Searcher !== null){ 
					if (parseInt(Searcher[1]) > iDepartures ){
						//adapter.log.error(State);
						await this.Fahrplan.delObjectAsync(State);
					}
				}	
			}
			this.Fahrplan.getChannels((error, Channels) => {
				if (Channels && Channels !== null){ 
					for (let Channel of Channels){
						let Searcher = Channel["_id"].toString().match(new RegExp(SectionRegEx));
						if (Searcher !== null){ 
							if (parseInt(Searcher[1]) > iDepartures ){
								this.Fahrplan.delObject(Channel["_id"]);
							}
						}	
					}
				}	
			});
		}catch(e){
			this.ErrorReporting(e, `Exception removing unused Departures`, "fHelpers", "deleteUnusedDepartures");
			throw `Exception in DeleteUnusedDepartures [${e}]`;
		}
	} 
	//#endregion
} 

module.exports = fHelpers