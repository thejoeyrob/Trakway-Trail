import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const runs = sqliteTable('runs', {
 id: text('id').primaryKey(), player: text('player').notNull(), started: integer('started').notNull(),
 finished: integer('finished'), nickname: text('nickname'), score: integer('score'),
 distance: integer('distance'), jobs: integer('jobs'), mode: text('mode').notNull(),
}, t => [index('score_idx').on(t.score), index('finished_idx').on(t.finished)]);
