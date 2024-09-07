import { promisify } from 'util';
import hostile from 'hostile';
import inquirer from "inquirer";
import chalk from 'chalk';
import z from 'zod';
import { $, file } from "bun"
import type { Host, HostsLines } from './types';
import { addIpIfMissing, getAll, setHostsByActiveHosts, updateHosts } from './utils';

/**
 * Note: Run with `sudo bun run ./hosts.ts`
 */


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
