/** Only technical transition fields may enter a public Actions artifact. */
export function publicBridgeReceipt(record: Record<string, any>, privateCopy?: Record<string, any>): Record<string, any> {
  const privateRequired = record.state === 'passed' && Boolean(record.completion_record || record.completion_source ||
    record.initialization_source || record.development_source);
  const verified = privateCopy?.state === 'archived_and_readback_verified' && privateCopy?.temporary_key_files_removed === true &&
    /^\/archive\/ordinary\/bridge-admission\/[a-zA-Z0-9._-]+\.json$/.test(privateCopy?.path || '') &&
    /^[a-f0-9]{64}$/.test(privateCopy?.sha256 || '');
  if (privateRequired && !verified) throw new Error('Private bridge record has not been preserved and read back');
  const keys = ['state', 'reason_codes', 'actor', 'feature', 'target_sha', 'contract_digest', 'check_set_digest',
    'transition', 'mode', 'source', 'runner_environment', 'read_by', 'read_at', 'input_digests', 'run_id', 'attempt',
    'record_kind', 'ci_ready', 'feature_complete', 'development_ready', 'development_source_sha',
    'initialization_source_sha', 'checkout_sha', 'toolchain_digest', 'scope_base_sha',
    'expected_sha', 'expected_actor', 'expected_feature', 'expected_contract_digest', 'expected_check_set_digest',
    'ownership_guard_passed', 'required_hooks_ran', 'working_tree_clean', 'changed_paths',
    'initialization_inputs_unchanged', 'initialization_ancestor_verified', 'development_inputs_unchanged',
    'development_ancestor_verified', 'required_results_passed', 'reports_read', 'tdd_passed', 'reviews_passed',
    'regressions_passed', 'baseline_required', 'baseline_confirmed'];
  const receipt = Object.fromEntries(keys.filter(key => record[key] !== undefined).map(key => [key, record[key]]));
  if (verified) receipt.private_record = { path: privateCopy!.path, sha256: privateCopy!.sha256,
    state: privateCopy!.state, temporary_key_files_removed: true };
  return receipt;
}
