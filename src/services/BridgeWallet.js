import Hasher from "@walletpack/core/util/Hasher";
import AES from 'aes-oop';
import IdGenerator from "@walletpack/core/util/IdGenerator";
import Mnemonic from "@walletpack/core/util/Mnemonic";
import * as bip32 from 'bip32';
import entropy from 'more-entropy';
import PluginRepository from '@walletpack/core/plugins/PluginRepository'
import StorageService from "./StorageService";
import Scatter from "@walletpack/core/models/Scatter";
import Compressor from "../util/Compressor";


export default class BridgeWallet {

	static async getScatter(psha){
		let scatter = AES.decrypt(StorageService.getScatter(), psha);
		if(!scatter.hasOwnProperty('keychain')) return false;
		scatter = Scatter.fromJson(scatter);
		scatter.decrypt(psha);
		return scatter;
	}

	static async createEntropy(rounds = 16){
		const getEnt = async () => {
			let ent;
			for(let i = 0; i < rounds; i++){
				ent = await Hasher.secureHash(IdGenerator.text(128), ent || 'begin');
			}
			return ent;
		}

		const ents = [];
		while(ents.length < 5) ents.push(await getEnt());

		const gen = new entropy.Generator();
		const e = (await new Promise(resolve => {
			gen.generate(1000, vals => {
				vals = vals.map(x => IdGenerator.text(Math.abs(x) > 128 ? 128 : Math.abs(x)) + vals);
				resolve(vals)
			});
		})).join('');
		const hash = await Hasher.secureHash(e, e.substr(Math.round(Math.random() * 100 + 1), 1000));

		return Hasher.unsaltedQuickHash(Hasher.unsaltedQuickHash(ents.join('')) + Hasher.unsaltedQuickHash(ents.reverse().join('')) + hash);
	}

	static async shaPass(pass){
		return await Hasher.secureHash(pass);
	}

	static async getLocalEntropy(psha){
		return AES.decrypt(Compressor.decompress(window.localStorage.getItem('boxent')), psha);
	}

	static async setLocalEntropy(ent, psha){
		return window.localStorage.setItem('boxent', Compressor.compress(AES.encrypt(ent, psha)));
	}

	static async makeSeed(uuid, entropy){
		return await Hasher.secureHash(uuid, entropy) + await Hasher.secureHash(entropy, uuid);
	}

	static async makeKey(seed, blockchain, index = 0){
		const node = bip32.fromSeed(Buffer.from(seed, 'hex'));
		const plugin = PluginRepository.plugin(blockchain);
		const buffer = node.derivePath(`${plugin.bip()}${index}`).privateKey;
		return plugin.bufferToHexPrivate(buffer);

	}

}