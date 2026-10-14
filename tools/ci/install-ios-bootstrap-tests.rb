require 'xcodeproj'

root = ENV.fetch('GITHUB_WORKSPACE')
project_path = File.join(root, 'apps/mobile/ios/AgoraWeave.xcodeproj')
project = Xcodeproj::Project.open(project_path)
app = project.targets.find { |target| target.name == 'AgoraWeave' }
abort 'Missing generated native app target' unless app
target = project.new_target(:ui_test_bundle, 'BootstrapShellTests', :ios, '16.4')
target.add_dependency(app)
source = project.main_group.new_group('BootstrapShellTests').new_file(File.join(root, 'tests/e2e/ios/BootstrapShellTests.swift'))
target.source_build_phase.add_file_reference(source)
target.build_configurations.each do |configuration|
  configuration.build_settings.merge!({
    'PRODUCT_BUNDLE_IDENTIFIER' => 'org.agoraweave.bootstrap.tests',
    'SWIFT_VERSION' => '5.0',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'TEST_TARGET_NAME' => 'AgoraWeave',
    'CODE_SIGNING_ALLOWED' => 'NO',
  })
end
project.save
scheme_path = File.join(project_path, 'xcshareddata/xcschemes/AgoraWeave.xcscheme')
scheme = Xcodeproj::XCScheme.new(scheme_path)
scheme.add_build_target(target, false)
scheme.add_test_target(target)
scheme.test_action.build_configuration = 'Release'
scheme.save_as(project_path, 'AgoraWeave', true)
puts "Configured one XCTest UI target with Xcodeproj #{Xcodeproj::VERSION}"
