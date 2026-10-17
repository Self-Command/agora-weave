ALTER TABLE core.outbox ADD CONSTRAINT outbox_event_type CHECK(event_type IN (
  'resource.changed','revision.changed','batch.changed','relation.changed','message.saved','access.changed','request.changed','notification.changed',
  'ai.source.changed','index.policy.changed','document.publication.changed','config.activated','plugin.lifecycle.changed','release.changed','purge.changed','service.health.changed'));
ALTER TABLE core.event_delivery ADD CONSTRAINT delivery_event_type CHECK(event_type IN (
  'resource.changed','revision.changed','batch.changed','relation.changed','message.saved','access.changed','request.changed','notification.changed',
  'ai.source.changed','index.policy.changed','document.publication.changed','config.activated','plugin.lifecycle.changed','release.changed','purge.changed','service.health.changed'));
