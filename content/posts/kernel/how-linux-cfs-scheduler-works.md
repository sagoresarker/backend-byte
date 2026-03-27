---
title: "How the Linux CFS Scheduler Works"
date: 2025-03-10T10:00:00+06:00
description: "A deep dive into the Completely Fair Scheduler — red-black trees, vruntime, and how the kernel decides which process runs next."
category: kernel
tags: [linux, scheduler, cfs, kernel-internals, processes]
draft: false
toc: true
math: false
mermaid: false
---

## Introduction

The Linux kernel's Completely Fair Scheduler (CFS) is responsible for deciding which process runs on a CPU at any given time. Introduced in kernel 2.6.23 by Ingo Molnár, CFS replaced the earlier O(1) scheduler with a design built around a simple principle: every process should get a fair share of CPU time.

## Background

Before CFS, the Linux kernel used a bitmap-based scheduler that operated in O(1) time but had well-known fairness issues, particularly for interactive workloads. CFS models an ideal, perfectly multitasking CPU that processes multiple tasks simultaneously by interleaving them in proportion to their weights.

## How vruntime Works

The key data structure in CFS is the **virtual runtime** (`vruntime`). Every runnable process has a `vruntime` value that tracks how much CPU time it has consumed, weighted by its priority (nice value).

```c
/* kernel/sched/fair.c */
static void update_curr(struct cfs_rq *cfs_rq)
{
    struct sched_entity *curr = cfs_rq->curr;
    u64 now = rq_clock_task(rq_of(cfs_rq));
    u64 delta_exec;

    delta_exec = now - curr->exec_start;
    curr->exec_start = now;
    curr->sum_exec_runtime += delta_exec;

    curr->vruntime += calc_delta_fair(delta_exec, curr);
    update_min_vruntime(cfs_rq);
}
```

The process with the smallest `vruntime` is always the next to run. This is where the red-black tree comes in.

## The Red-Black Tree

CFS stores all runnable processes in a self-balancing red-black tree, keyed by `vruntime`. The leftmost node always has the smallest `vruntime` — the process that is most deserving of CPU time.

Picking the next process is O(1): just grab the leftmost node. Inserting or removing a process is O(log n).

## Deep Dive

### Scheduling Period and Granularity

CFS doesn't switch tasks on every clock tick. It uses a concept called **scheduling latency** (`sysctl_sched_latency_ns`): the period over which every runnable task gets at least one slice of CPU time. By default this is 6ms on a lightly loaded system.

The minimum slice a process gets is governed by `sysctl_sched_min_granularity_ns` (default: 0.75ms). This prevents excessive context switching.

### Nice Values and Weights

The nice value (-20 to +19) maps to a weight table. A process with nice=0 has weight 1024. Each step in nice value changes weight by ~25%.

```c
const int sched_prio_to_weight[40] = {
    /* -20 */ 88761, 71755, 56483, 46273, 36291,
    /* -15 */ 29154, 23254, 18705, 14949, 11916,
    /* -10 */  9548,  7620,  6100,  4904,  3906,
    /*  -5 */  3121,  2501,  1991,  1586,  1277,
    /*   0 */  1024,   820,   655,   526,   423,
    /*   5 */   335,   272,   215,   172,   137,
    /*  10 */   110,    87,    70,    56,    45,
    /*  15 */    36,    29,    23,    18,    15,
};
```

A process with nice=-5 (weight 3121) gets roughly 3x the CPU time of a nice=0 process (weight 1024) when they compete.

## Conclusion

CFS achieves fairness by always running the process with the least accumulated CPU time. The red-black tree data structure makes scheduling decisions efficient even with thousands of runnable processes. Understanding vruntime and scheduling weights is essential when tuning application performance on Linux systems.
