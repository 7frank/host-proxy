import z from 'zod';


/**
 * Note: Run with `sudo bun run ./hosts.ts`
 */


export
    const Host = z.object({
        ip: z.string().optional(),
        host: z.string(),
        active: z.boolean(),
    })
export
    type Host = z.infer<typeof Host>

export const HostsLines = z.array(z.tuple([z.string(), z.string()]))
export type HostsLines = z.infer<typeof HostsLines>
