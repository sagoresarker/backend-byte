---
title: "TCP Handshake Internals"
date: 2025-02-18T09:00:00+06:00
description: "What really happens during a TCP three-way handshake — kernel state machines, SYN queues, backlog, and SYN flood defenses."
category: networking
tags: [tcp, networking, linux, kernel, sockets]
draft: false
toc: true
math: false
---

## Introduction

The TCP three-way handshake is described in every networking textbook. But the actual kernel implementation involves several queues, state transitions, and security mechanisms that textbooks skip. This article covers what really happens from `connect()` on the client to `accept()` on the server.

## The SYN Queue and Accept Queue

Linux maintains **two queues** per listening socket, not one:

1. **SYN queue** (`icsk_accept_queue.listen_opt`): Half-open connections — SYN received, SYN-ACK sent, waiting for final ACK.
2. **Accept queue** (`icsk_accept_queue`): Fully established connections waiting for `accept()`.

The sizes are controlled by:
- `net.ipv4.tcp_max_syn_backlog` — SYN queue depth (default: 128-1024 depending on memory)
- The `backlog` argument to `listen()` — accept queue depth

## Deep Dive: Kernel State Machine

```c
/* net/ipv4/tcp_input.c — simplified */
int tcp_rcv_state_process(struct sock *sk, struct sk_buff *skb)
{
    switch (sk->sk_state) {
    case TCP_LISTEN:
        /* SYN received: allocate request_sock, send SYN-ACK */
        return tcp_v4_conn_request(sk, skb);

    case TCP_SYN_RECV:
        /* Final ACK received: move to ESTABLISHED, wake accept() */
        if (tcp_check_req(sk, skb, req, false))
            tcp_child_process(sk, nsk, skb);
        break;
    }
}
```

## SYN Cookies

When the SYN queue is full, Linux falls back to **SYN cookies** (enabled via `net.ipv4.tcp_syncookies`). Instead of allocating a `request_sock`, the kernel encodes connection parameters into the ISN (Initial Sequence Number) of the SYN-ACK.

When the final ACK arrives, the kernel decodes the cookie to reconstruct the connection — no state was stored. This defeats SYN flood attacks at the cost of losing some TCP options (window scaling, SACK) until the connection is established.

## Conclusion

The TCP handshake isn't a single atomic operation — it involves two distinct kernel queues, a state machine with 11 states, and optional cookie-based stateless connection tracking. Understanding these internals is essential for tuning high-throughput servers and diagnosing connection issues.
