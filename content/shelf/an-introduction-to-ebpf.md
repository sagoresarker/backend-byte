---
title: "A Thorough Introduction to eBPF"
date: 2025-03-01T00:00:00+06:00
authors: ["Matt Oswalt"]
year: 2023
paperURL: "https://lwn.net/Articles/740157/"
summary: "An in-depth walkthrough of eBPF — what it is, how the verifier works, JIT compilation, maps, and the program types available in the kernel. Covers the safety model that makes eBPF programs safe to run in kernel space without risking a crash."
relatedPost: ""
tags: [ebpf, linux, kernel, networking]
draft: false
---

## Why I Read This

eBPF is fundamental to modern Linux observability and networking tooling. Understanding the verifier and map types is a prerequisite for writing anything non-trivial with libbpf.

## Key Takeaways

- The eBPF verifier performs static analysis at load time — it rejects programs with unbounded loops, invalid memory accesses, and stack overflows before they ever run.
- BPF maps are the primary mechanism for sharing data between the kernel-space eBPF program and user space. Choosing the right map type (hash, array, ring buffer, LRU) has significant performance implications.
- JIT compilation means eBPF programs run at near-native speed — the interpreted fallback is only used on architectures without a JIT backend.
- Program types (kprobes, tracepoints, XDP, tc) determine what kernel hooks the program can attach to and what helper functions are available.

## What I Found Surprising

The verifier tracks every possible code path and refuses programs where any path could lead to an unsafe state. This is stricter than most developers expect — even dead code that can never execute at runtime must pass verification.
