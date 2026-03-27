---
title: "Understanding Linux Namespaces"
date: 2026-03-27T10:00:00+06:00
description: "How Linux namespaces isolate processes, filesystems, networks, and more — the foundation of containers like Docker and Kubernetes."
category: kernel
tags: [linux, namespaces, containers, isolation, kernel]
draft: false
toc: true
math: false
mermaid: false
---

## Introduction

Linux namespaces are the kernel mechanism that makes containers possible. Every container you run with Docker or Kubernetes is, at its core, just a process wrapped in a set of namespaces. Understanding them is fundamental to understanding how modern container runtimes work.

A namespace wraps a global system resource in an abstraction that makes the processes within the namespace believe they have their own isolated instance of that resource.

## The Six Namespace Types

The Linux kernel provides six (now seven, with time namespaces added in 5.6) distinct namespace types:

### 1. PID Namespace

The PID namespace isolates process IDs. The first process in a new PID namespace gets PID 1 — it becomes the "init" of that namespace. Processes inside cannot see or signal processes outside.

```c
// Create a new process in a new PID namespace
clone(child_fn, stack, CLONE_NEWPID | SIGCHLD, NULL);
```

### 2. Network Namespace

Each network namespace gets its own network stack: interfaces, routing tables, firewall rules, sockets. This is why containers can each have their own `eth0` with a private IP.

```bash
# Create a new netns
ip netns add myns
ip netns exec myns ip link list
```

### 3. Mount Namespace

Isolates the filesystem mount table. Changes to mounts inside the namespace don't propagate outside. This is how containers get their own root filesystem.

### 4. UTS Namespace

Isolates the hostname and domain name. A container can have its own hostname independent of the host.

### 5. IPC Namespace

Isolates System V IPC objects (message queues, semaphores, shared memory) and POSIX message queues.

### 6. User Namespace

The most powerful — maps user and group IDs between the namespace and the host. A process can be root inside a user namespace while being an unprivileged user on the host. This enables rootless containers.

## Creating Namespaces

Three syscalls manage namespaces:

- `clone(2)` — create a new process in new namespaces
- `unshare(2)` — move the calling process into new namespaces
- `setns(2)` — join an existing namespace via a file descriptor

```c
#include <sched.h>

// Enter a new UTS + network namespace
unshare(CLONE_NEWUTS | CLONE_NEWNET);
```

## How Docker Uses Namespaces

When you run `docker run ubuntu`, the Docker daemon calls `clone()` with a combination of namespace flags. The resulting process has:

- Its own PID space (PID 1 = the container entrypoint)
- Its own network stack (bridged to the host via veth pairs)
- Its own mount table (overlayfs root)
- Its own hostname

None of this requires a hypervisor — it is pure kernel feature composition.

## Inspecting Namespaces

Each process's namespaces are exposed as symlinks under `/proc/<pid>/ns/`:

```bash
ls -la /proc/$$/ns/
# lrwxrwxrwx ... net -> net:[4026531992]
# lrwxrwxrwx ... pid -> pid:[4026531836]
# lrwxrwxrwx ... uts -> uts:[4026531838]
```

Two processes sharing a namespace inode number are in the same namespace.

## Conclusion

Namespaces are elegant in their simplicity — each one does exactly one thing. Composed together, they provide the isolation model that containers depend on, all implemented as first-class kernel primitives without any virtualization overhead.
