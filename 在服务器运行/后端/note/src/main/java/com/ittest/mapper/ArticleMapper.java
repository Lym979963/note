package com.ittest.mapper;

import com.ittest.pojo.Article;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ArticleMapper {
    @Insert("INSERT INTO article(title, content, category_id, create_user, create_time, update_time) " +
            "VALUES(#{title}, #{content}, #{categoryId}, #{createUser}, #{createTime}, #{updateTime})")
    void add(Article article);

    @Select("select * from article where category_id=#{categoryId}")
    List<Article> list(Integer categoryId);

    @Select("select * from article where id=#{articleId}")
    Article article(Integer articleId);

    @Update("update article set title=#{title},content=#{content},update_time=now() where id=#{id}")
    void update(Article article);

    @Delete("delete from article where id=#{id}")
    void delete(Integer id);
}
