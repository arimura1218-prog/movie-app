import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 全データ取得 (GET)
export async function GET() {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedData = (data || []).map((item: any) => ({
    id: item.id.toString(),
    title: item.title,
    genre: item.genre,
    status: item.status,
    watchedDate: item.watched_date,
    watcher: item.watcher,
    memo: item.memo,
    imageUrl: item.image_url,
    rating: item.rating ?? 3.5,
  }));

  return NextResponse.json(formattedData);
}

// 新規データ追加 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newId = Date.now().toString();

    const newMovie = {
      id: newId,
      title: body.title || '無題',
      genre: body.genre || 'アクション',
      status: body.status || '観たい',
      watched_date: body.watchedDate || '',
      watcher: body.watcher || '',
      memo: body.memo || '',
      image_url: body.imageUrl || '',
      rating: body.rating ?? 3.5,
    };

    const { data, error } = await supabase
      .from('movies')
      .insert([newMovie])
      .select();

    if (error) {
      console.error('API POST Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Failed to insert movie' }, { status: 500 });
    }

    const responseItem = {
      id: data[0].id.toString(),
      title: data[0].title,
      genre: data[0].genre,
      status: data[0].status,
      watchedDate: data[0].watched_date,
      watcher: data[0].watcher,
      memo: data[0].memo,
      imageUrl: data[0].image_url,
      rating: data[0].rating,
    };

    return NextResponse.json(responseItem, { status: 201 });
  } catch (e: any) {
    console.error('API POST Exception:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}

// データ更新 (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.genre !== undefined) updateData.genre = body.genre;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.watchedDate !== undefined) updateData.watched_date = body.watchedDate;
    if (body.watcher !== undefined) updateData.watcher = body.watcher;
    if (body.memo !== undefined) updateData.memo = body.memo;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.rating !== undefined) updateData.rating = body.rating;

    const { error } = await supabase
      .from('movies')
      .update(updateData)
      .eq('id', body.id);

    if (error) {
      console.error('API PUT Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('API PUT Exception:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}

// データ削除 (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('API DELETE Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('API DELETE Exception:', e);
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}