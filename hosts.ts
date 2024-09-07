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


const getAll = promisify(hostile.get);
const setHost = promisify(hostile.set);
const removeHost = promisify(hostile.remove);


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



/**
 * Defines the default hosts that can be proxied with local development.
 * Each host has a `host` property representing the hostname, and an `active` property
 * indicating whether the host is currently active for proxying.
 */

let defaultHosts: Host[] = [
    {
        host: 'msl-documentation.kong.7frank.internal.jambit.io',
        active: true,
    },
    {
        host: 'msl-search.internal.jambit.io',
        active: false,
    },
];

// add ip if not exists


function addIpIfMissing(host: Host) {
    if (!host.ip) {
        host.ip = '127.0.0.1';
    }
    return host;
}

function setHostsByActiveHosts(activeHosts: Host[]) {
    return (host: Host) => ({
        ...host,
        active: activeHosts.some(it => it.host === host.host)
    })
}

defaultHosts = defaultHosts.map(addIpIfMissing);
const lines: HostsLines = await getAll(false)
const currentActiveHosts = lines.map(([ip, host]) => ({ ip, host, active: true }))


// set defaultHosts to active or not active based on current active hosts
defaultHosts = defaultHosts.map(setHostsByActiveHosts(currentActiveHosts))

// use inquirer and list all options of hosts. let the user select or unselect
const res = await inquirer.prompt<{ hosts: Host[] }>([
    {
        type: 'checkbox',
        name: 'hosts',
        message: 'Select hosts that will be proxied with local dev :',
        choices: defaultHosts.map((host) => ({
            name: host.host,
            value: host,
            checked: host.active,
        })),
    },
])

// update hosts with active status
const updatedHosts = defaultHosts.map(setHostsByActiveHosts(res.hosts))


updateHosts(updatedHosts);
