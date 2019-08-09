import Vue from 'vue'
import Vuex from 'vuex';

import {mutations} from './mutations';
import {actions} from './actions';
import THEMES from "../util/Themes";
import {PopupDisplayTypes} from "../models/popups/Popup";

Vue.use(Vuex);

export const state = {
	// CORE!
	// ---------------------------------
	dappLogos:{},
	dappData:{},
	resources:{},
	scatter:null,
	popups:[],
	balances:{},
	prices:{},
	priceData:{},
	// ---------------------------------




	history:[],
	featuredApps:[],
	bought:[],

	kycRequired:false,

	theme:window.localStorage.getItem('theme') || THEMES.FLUORESCENT,
	topActionsColor:null,

	isMobile:false,
	isMobileDevice:false,
	scroll:0,
	swiped:null,
	working:false,
};

export const getters = {
	unlocked:state =>       state.scatter !== null
							&& typeof state.scatter !== 'string'
							&& typeof state.scatter.isEncrypted === 'function'
							&& !state.scatter.isEncrypted(),

	// Popups
	popIns:state =>         state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN) || [],
	nextPopIn:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.POP_IN)[0] || null,
	snackbars:state =>      state.popups.filter(x => x.displayType === PopupDisplayTypes.SNACKBAR) || [],

	identity:state =>       state.scatter.keychain.identities[0],
};

const proxyHandler = {
	get:(obj, prop) => obj[prop],
	set:() => false,
	deleteProperty:() => false,
	apply:() => false,
	construct:() => false,
	defineProperty:() => false,
	setPrototypeOf:() => false,
}

export const store = new Proxy(new Vuex.Store({
	state,
	getters,
	mutations,
	actions
}), proxyHandler);
