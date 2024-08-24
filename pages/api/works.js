// pages/api/works.js

import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // 从环境变量中获取
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY; // 从环境变量中获取
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // 获取作品列表或单个作品
      try {
        if (req.query.id) {
          // 根据 ID 获取单个作品
          const { data: work, error } = await supabase
            .from('works')
            .select('*')
            .eq('id', req.query.id)
            .single();

          if (error) {
            console.error('获取作品失败:', error.message);
            return res.status(404).json({ message: '未找到该作品' });
          }
          return res.status(200).json(work);
        } else {
          // 获取所有作品
          const { data: works, error } = await supabase
            .from('works')
            .select('*');

          if (error) {
            console.error('获取作品失败:', error.message);
            return res.status(500).json({ message: '获取作品失败', error: error.message });
          }
          return res.status(200).json(works);
        }
      } catch (error) {
        console.error('获取作品失败:', error.message);
        return res.status(500).json({ message: '获取作品失败', error: error.message });
      }
      break;

    case 'POST':
      // 创建新作品
      const { code, screenshot, title, author } = req.body;
      try {
        // 数据验证 (根据需要添加更多验证规则)
        if (!code || !screenshot || !title || !author) {
          return res.status(400).json({ message: '缺少必要参数' });
        }

        const { data: newWork, error } = await supabase
          .from('works')
          .insert([{ code, screenshot, title, author }])
          .select('*'); // 确保返回插入的行

        // 检查是否成功插入数据
        if (error) {
          console.error('作品创建失败:', error.message);
          return res.status(500).json({
            message: '作品创建失败',
            error: error.message,
          });
        }

        // 检查 newWork 是否有效
        if (!newWork || newWork.length === 0) {
          console.error('插入后没有返回数据');
          return res.status(500).json({
            message: '作品创建失败',
            error: '插入后没有返回数据',
          });
        }

        return res.status(201).json({
          message: '作品创建成功',
          workId: newWork[0].id, // 访问插入后的 ID
        });
      } catch (error) {
        console.error('作品创建失败:', error.message, error.stack); // 打印详细的错误信息
        return res.status(500).json({
          message: '作品创建失败',
          error: error.message,
        });
      }
      break;

    case 'DELETE':
      // 删除作品
      const { id } = req.query; // 从查询参数中获取要删除的作品 ID
      try {
        if (!id) {
          return res.status(400).json({ message: '缺少作品 ID' });
        }

        const { error } = await supabase
          .from('works')
          .delete()
          .eq('id', id); // 根据 ID 删除作品

        if (error) {
          console.error('删除作品失败:', error.message);
          return res.status(500).json({
            message: '删除作品失败',
            error: error.message,
          });
        }

        return res.status(204).end(); // 返回 204 No Content 表示成功删除
      } catch (error) {
        console.error('删除作品失败:', error.message);
        return res.status(500).json({
          message: '删除作品失败',
          error: error.message,
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
