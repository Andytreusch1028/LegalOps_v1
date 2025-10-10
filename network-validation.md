# Network Validation Runbook

Use this when you need to confirm the VPC, subnet, and security-group baseline is reproducible across environments. The Terraform module under `infrastructure/network/terraform` captures the expected state.

## Prerequisites
- Terraform `>= 1.5.0` installed locally.
- AWS credentials for the target account (CLI profile or environment variables).
- Chosen environment variables (CIDRs, AZs, tags) documented in the backlog or infrastructure records.

## Steps
1. Navigate to the module directory:
   ```powershell
   cd infrastructure/network/terraform
   ```
2. Copy the example tfvars and tailor it to your environment:
   ```powershell
   Copy-Item environments/dev.tfvars.example environments/dev.tfvars
   # Edit the file to match your CIDRs, AZs, tags, and security group rules.
   ```
3. Run the validation workflow:
   ```powershell
   terraform init
   terraform fmt
   terraform validate
   terraform plan -var-file=environments/dev.tfvars
   ```
4. Review the plan output carefully. Confirm it matches the manual configuration noted in `.md_Files/DEVELOPMENT_PROTOCOL.md`.
5. If everything looks correct, apply the plan:
   ```powershell
   terraform apply -var-file=environments/dev.tfvars
   ```
6. Record results in `docs/journal.md` (what changed, which tests/commands you ran). Update ADRs or the risk register if new decisions emerge.

## Troubleshooting
- **Provider authentication errors**: ensure your AWS profile/keys are exported. Run `aws sts get-caller-identity` to confirm access.
- **CIDR overlap issues**: adjust the subnet ranges so public and private blocks do not overlap and stay inside the VPC CIDR.
- **Security group conflicts**: double-check rule descriptions/ports in the tfvars file; Terraform will highlight duplicates.

Keep plans small and reversible. If the plan drifts significantly from the manual environment, stop and reconcile differences before applying.
