---
title: "Building Production gRPC Services in Go"
date: 2025-01-25T10:00:00+06:00
description: "A practical guide to building production-ready gRPC services in Go — interceptors, deadlines, reflection, health checks, and graceful shutdown."
category: backend
tags: [golang, grpc, backend, microservices, api-design]
draft: false
toc: true
---

## Introduction

gRPC is the default RPC framework for service-to-service communication in most Go shops today. The basics are simple — define a `.proto` file, generate code, implement the interface. But production services need more: observability, graceful shutdown, proper deadline propagation, and health checking.

## Service Structure

A clean Go gRPC service separates concerns:

```
service/
├── cmd/server/main.go       # Wire everything together, start server
├── internal/
│   ├── handler/             # gRPC handler implementations
│   ├── repository/          # Database access
│   └── interceptor/         # Unary and stream interceptors
├── proto/                   # .proto definitions
└── gen/                     # Generated Go code
```

## Interceptors for Cross-Cutting Concerns

```go
// internal/interceptor/logging.go
func UnaryLoggingInterceptor(log *slog.Logger) grpc.UnaryServerInterceptor {
    return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
        start := time.Now()
        resp, err := handler(ctx, req)
        log.Info("grpc request",
            "method", info.FullMethod,
            "duration_ms", time.Since(start).Milliseconds(),
            "error", err,
        )
        return resp, err
    }
}
```

Chain multiple interceptors with `grpc.ChainUnaryInterceptor`.

## Graceful Shutdown

```go
func main() {
    srv := grpc.NewServer(opts...)
    // ... register services

    go func() {
        if err := srv.Serve(lis); err != nil {
            log.Fatal(err)
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    // GracefulStop waits for in-flight RPCs to complete
    srv.GracefulStop()
}
```

## Conclusion

Production gRPC services in Go are straightforward once you establish patterns for interceptors, health checks, and graceful shutdown. The key is wiring these together consistently at startup rather than adding them ad-hoc.
