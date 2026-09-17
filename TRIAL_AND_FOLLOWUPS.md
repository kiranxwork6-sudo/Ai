# Trials and follow-ups

Businesses now receive a persisted seven-day `subscription` trial record when the file-store migration runs. `customer_follow_ups` supports `businessId`, customer/conversation IDs, type, `scheduledFor`, status, template name, metadata, and sent time through `db.scheduleFollowUp`.

Delivery is intentionally not scheduled in-process. Production needs a durable queue/worker (for example, a managed scheduler plus queue) that sends only approved Meta templates outside the customer-service window and records the returned Meta message ID. Promotional consent and Meta template policy are mandatory.
