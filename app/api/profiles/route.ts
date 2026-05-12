

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const { user_id, profile } = await req.json();

    await client.query('BEGIN');

    const existing = await client.query(
      `SELECT id FROM freelancer_profiles WHERE user_id = $1 LIMIT 1`,
      [user_id]
    );

    let freelancerProfileId: number;

    if (existing.rows.length > 0) {
      freelancerProfileId = existing.rows[0].id;

      await client.query(
        `UPDATE freelancer_profiles SET
          profile_id = $1, name = $2, title = $3, profile_url = $4,
          search_url = $5, location = $6, avatar_url = $7, hourly_rate = $8,
          job_success = $9, earnings = $10, available_now = $11, top_rated = $12,
          description = $13, jobs_related_count = $14, scraped_at = $15,
          updated_at = NOW()
        WHERE id = $16`,
        [
          profile.profileId, profile.name, profile.title, profile.profileUrl,
          profile.searchUrl, profile.location, profile.avatarUrl, profile.rate,
          profile.jobSuccess, profile.earnings, profile.hasAvailableNow, profile.hasTopRated,
          profile.description, profile.jobsRelatedCount, profile.scrapedAt,
          freelancerProfileId,
        ]
      );

      await client.query(
        `DELETE FROM freelancer_skills WHERE freelancer_profile_id = $1`,
        [freelancerProfileId]
      );
    } else {
      const inserted = await client.query(
        `INSERT INTO freelancer_profiles (
          user_id, profile_id, name, title, profile_url, search_url, location,
          avatar_url, hourly_rate, job_success, earnings, available_now, top_rated,
          description, jobs_related_count, scraped_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING id`,
        [
          user_id, profile.profileId, profile.name, profile.title, profile.profileUrl,
          profile.searchUrl, profile.location, profile.avatarUrl, profile.rate,
          profile.jobSuccess, profile.earnings, profile.hasAvailableNow, profile.hasTopRated,
          profile.description, profile.jobsRelatedCount, profile.scrapedAt,
        ]
      );

      freelancerProfileId = inserted.rows[0].id;
    }

    for (const skill of profile.skills || []) {
      await client.query(
        `INSERT INTO freelancer_skills (freelancer_profile_id, skill) VALUES ($1, $2)`,
        [freelancerProfileId, skill]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({ success: true, freelancerProfileId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to save profile' }, { status: 500 });
  } finally {
    client.release();
  }
}