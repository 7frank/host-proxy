import { promisify } from 'util';
import hostile from 'hostile';
import inquirer from "inquirer";
import chalk from 'chalk';
import z from 'zod';
import { $, file } from "bun"
import type { Host, HostsLines } from './types';

/**
 * Note: Run with `sudo bun run ./hosts.ts`
 */

export const getAll = promisify(hostile.get);

export const setHost = promisify(hostile.set);
export const removeHost = promisify(hostile.remove);

export
    async function updateHosts(hosts: Host[]) {
    for await (const host of hosts) {
        try {
            if (host.active) {
                await setHost(host.ip, host.host)
                console.log(chalk.green(`Set ${host.host} (${host.ip})`));

            } else {
                await removeHost(host.ip, host.host);
                console.log(chalk.red(`Removed ${host.host} (${host.ip})`));
            }
        } catch (error: any) {
            console.error(`Error setting`, host, ('message' in error) ? error.message : error);
        }
    }
}

export
    function addIpIfMissing(host: Host) {
    if (!host.ip) {
        host.ip = '127.0.0.1';
    }
    return host;
}

export
    function setHostsByActiveHosts(activeHosts: Host[]) {
    return (host: Host) => ({
        ...host,
        active: activeHosts.some(it => it.host === host.host)
    })
}
