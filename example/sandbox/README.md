## How to dev

- Setup local nodes https://docs.wavesenterprise.com/en/latest/get-started/sandbox/sandbox.html. Do not start.
- Modify nodes config `functionality` section with:
  ```
  functionality {
        feature-check-blocks-period = 1500
        blocks-for-feature-activation = 1000
        pre-activated-features {
          2 = 0
          3 = 0
          4 = 0
          5 = 0
          6 = 0
          7 = 0
          9 = 0
          10 = 0
          100 = 0
          101 = 0
          120 = 0
          130 = 0
          140 = 0
          160 = 0
          162 = 0
        }
  }
  ```
  State of nodes should be clean to take effect. Feature 120 must be enabled.
- Modify nodes config `docker-engine` section like this
```
docker-engine {
    enable = "yes"
    use-node-docker-host = "yes"
    default-registry-domain = "registry.wavesenterprise.com/waves-enterprise-public"
    docker-host = "unix:///var/run/docker.sock"
    execution-limits {
      timeout = "100s"
      memory = 1024
      memory-swap = 0
      startup-timeout = "100s"
    }
    remove-container-on-fail = "no"
    reuse-containers = "yes"
    remove-container-after = "30m"
    remote-registries = []
    check-registry-auth-on-startup = "yes"
    contract-execution-messages-cache {
      expire-after = "60m"
      max-buffer-size = 10
      max-buffer-time = "100ms"
    }
  }
```
Optionaly add `contracts-parallelism = 8` in docker engine section to embrace the power of parallel execution
- start nodes
- Setup local docker registry `docker run -d -p 5000:5000 --name registry registry:2`
- `cp example/sandbox/.env.example example/sandbox/.env`
- Fill in .env values
```
NODE_ADDRESS=http://localhost:6862
NODE_BLOCKCHAIN_ADDRESS=<blockchain address of node-0 from credentials.txt, located in nodes setup folder>
NODE_KEYPAIR_PASSWORD=<keypair password of node-0 from credentials.txt, located in nodes setup folder>
NODE_API_KEY=<API key of node-0 from credentials.txt, located in nodes setup folder>
```
- In separete terminal `npm run logger`
- `npm run start`
