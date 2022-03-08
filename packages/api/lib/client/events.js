"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const eventsource_1 = __importDefault(require("eventsource"));
const events_1 = require("../routes/events");
const format_1 = require("./utils/format");
/**
 * REST HTTP client for events routes
 */
function getClient(_config, baseUrl) {
    const eventSerdes = (0, events_1.getEventSerdes)();
    return {
        eventstream: async (topics, signal, onEvent) => {
            const query = (0, format_1.stringifyQuery)({ topics });
            // TODO: Use a proper URL formatter
            const url = `${baseUrl}${events_1.routesData.eventstream.url}?${query}`;
            const eventSource = new eventsource_1.default(url);
            try {
                await new Promise((resolve, reject) => {
                    for (const topic of topics) {
                        eventSource.addEventListener(topic, ((event) => {
                            const message = eventSerdes.fromJson(topic, JSON.parse(event.data));
                            onEvent({ type: topic, message });
                        }));
                    }
                    // EventSource will try to reconnect always on all errors
                    // `eventSource.onerror` events are informative but don't indicate the EventSource closed
                    // The only way to abort the connection from the client is via eventSource.close()
                    eventSource.onerror = function onerror(err) {
                        const errEs = err;
                        // Consider 400 and 500 status errors unrecoverable, close the eventsource
                        if (errEs.status === 400) {
                            reject(Error(`400 Invalid topics: ${errEs.message}`));
                        }
                        if (errEs.status === 500) {
                            reject(Error(`500 Internal Server Error: ${errEs.message}`));
                        }
                        // TODO: else log the error somewhere
                        // console.log("eventstream client error", errEs);
                    };
                    // And abort resolve the promise so finally {} eventSource.close()
                    signal.addEventListener("abort", () => resolve(), { once: true });
                });
            }
            finally {
                eventSource.close();
            }
        },
    };
}
exports.getClient = getClient;
//# sourceMappingURL=events.js.map